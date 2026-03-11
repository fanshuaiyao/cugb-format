import { IStyleSheet } from "style-sheet";
import { Import, Body } from "docx-ts";
import { UserSecretary, IClassificationConfig } from "docx-secretary";
import { ElementToFile, ExtractSections, ISection } from "xml-util";
import { MainGardener } from "./section/main/main";
import { AbstractTocGardener } from "./section/abstract-toc/abstract-toc";

export interface IGraftConfig
{
    sectionMap?: { [index: string]: number };
    sectionStyleKeys?: {
        [index: string]: {
            styleKey: string;
            headerId: string;
        };
    };
    frontMatter?: any;
    classification?: IClassificationConfig;
    outlineLevelMap?: { [index: string]: string };
    decimalPatterns?: { [index: string]: string };
    headingStripPatterns?: Array<string>;
}

const DefaultIndexTable: { [index: string]: number } =
{
    "abstract_toc": 0,
    "main": 1
}

const DefaultSectionStyleKeys: { [index: string]: { styleKey: string; headerId: string } } =
{
    "abstract_toc": { styleKey: "section0", headerId: "header1" },
    "main": { styleKey: "section1", headerId: "header2" }
}

function Index(section_name: string, sections_length: number, indexTable: { [index: string]: number })
{
    if (sections_length === 1)
    {
        return 0;
    }
    else if (section_name in indexTable)
    {
        return indexTable[section_name];
    }
}

export function Graft({ style_sheet, user_doc, user_styles, user_numbering, config }:
    { style_sheet: IStyleSheet; user_doc: string, user_styles: string, user_numbering?: string, config?: IGraftConfig }): string
{

    const __document = Import(user_doc);
    const old_body = __document.GetBody();
    const sections = ExtractSections(old_body.PrepareXml().elements);

    const indexTable = (config && config.sectionMap) || DefaultIndexTable;
    const sectionStyleKeys = (config && config.sectionStyleKeys) || DefaultSectionStyleKeys;

    const secretary = new UserSecretary(
        config && config.classification,
        config && config.outlineLevelMap,
        config && config.decimalPatterns
    )
        .UnderstandStyle(user_styles)
        .UnderstandNumbering(user_numbering);

    const new_body = new Body();

    if (sections.length > 1)
    {
        const abstract_toc_keys = sectionStyleKeys["abstract_toc"] || DefaultSectionStyleKeys["abstract_toc"];
        const abstract_toc = sections[Index("abstract_toc", sections.length, indexTable)] as ISection;
        abstract_toc && AbstractTocGardener.Graft({
            style_sheet,
            section: abstract_toc,
            frontMatter: config && config.frontMatter,
            sectionStyleKey: abstract_toc_keys.styleKey,
            sectionHeaderId: abstract_toc_keys.headerId
        }).forEach(e => new_body.AddChild(e));
    }

    const main_keys = sectionStyleKeys["main"] || DefaultSectionStyleKeys["main"];
    const main_toc = sections[Index("main", sections.length, indexTable)] as ISection;
    main_toc && MainGardener.Graft({
        style_sheet,
        section: main_toc,
        secretary,
        sectionStyleKey: main_keys.styleKey,
        sectionHeaderId: main_keys.headerId,
        headingStripPatterns: config && config.headingStripPatterns
    }).forEach(e => new_body.AddChild(e));

    __document.SetBody(new_body);

    return ElementToFile(__document.PrepareXml());
}
