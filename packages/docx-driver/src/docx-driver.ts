import { DocxPackage } from "docx-package";
import { InjectPackage, InjectPackageNative } from "docx-inject";
import { StyleSheet } from "style-sheet";
import { Graft } from "style-gardener";

export interface IFormatConfig
{
    styleNameMap?: { [index: string]: string };
    outlineLevelMap?: { [index: string]: string };
    classification?: {
        pureChapters: Array<string>;
        pureSections: Array<string>;
        captionPrefixes: { [index: string]: string };
        headingPatterns: {
            chapter: Array<string>;
            section: Array<string>;
            subsection: Array<string>;
        };
        headingStripPatterns: Array<string>;
    };
    frontMatter?: any;
    sections?: {
        sectionMap: { [index: string]: number };
        sectionStyleKeys: {
            [index: string]: {
                styleKey: string;
                headerId: string;
            };
        };
    };
    numbering?: {
        decimalPatterns: { [index: string]: string };
    };
    postProcessing?: {
        textReplacements: Array<{
            find: string;
            replace: string;
        }>;
    };
}

/**
 * @todo remove this method and rename the native one
 */
export async function FormatPackage({ input, standard, config }: { input: DocxPackage, standard: DocxPackage, config?: IFormatConfig })
{
    const styleNameMap = config && config.styleNameMap;
    const style_sheet = new StyleSheet({ styles_xml: await standard.Read("styles") as string, document_xml: await standard.Read("document") as string, styleNameMap });
    const user_doc = await input.Read("document") as string;
    const user_styles = await input.Read("styles") as string;
    const user_numbering = await input.Read("numbering") as string;

    const graftConfig = config ? {
        sectionMap: config.sections && config.sections.sectionMap,
        sectionStyleKeys: config.sections && config.sections.sectionStyleKeys,
        frontMatter: config.frontMatter,
        classification: config.classification,
        outlineLevelMap: config.outlineLevelMap,
        decimalPatterns: config.numbering && config.numbering.decimalPatterns,
        headingStripPatterns: config.classification && config.classification.headingStripPatterns
    } : undefined;

    const grafted = Graft({ style_sheet, user_doc, user_numbering, user_styles, config: graftConfig });
    input.Save({ content: grafted, name: "document" });

    // caution! the order matters
    // if you inject package first, you will lost original user style
    await InjectPackage({ input, standard });
}

//
export async function DocxIsValid(input:DocxPackage)
{
    const user_doc = await input.Read("document") as string;
    return !user_doc.includes(`<w:docPartGallery w:val="Table of Contents"/>`);
}

export async function FormatPackageNative({ input, standard, config }: { input: DocxPackage, standard: DocxPackage, config?: IFormatConfig })
{
    const styleNameMap = config && config.styleNameMap;
    const style_sheet = new StyleSheet({ styles_xml: await standard.Read("styles") as string, document_xml: await standard.Read("document") as string, styleNameMap });
    const user_doc = await input.Read("document") as string;
    const user_styles = await input.Read("styles") as string;
    const user_numbering = await input.Read("numbering") as string;

    const graftConfig = config ? {
        sectionMap: config.sections && config.sections.sectionMap,
        sectionStyleKeys: config.sections && config.sections.sectionStyleKeys,
        frontMatter: config.frontMatter,
        classification: config.classification,
        outlineLevelMap: config.outlineLevelMap,
        decimalPatterns: config.numbering && config.numbering.decimalPatterns,
        headingStripPatterns: config.classification && config.classification.headingStripPatterns
    } : undefined;

    let grafted = Graft({ style_sheet, user_doc, user_numbering, user_styles, config: graftConfig });

    /**
     * @todo temp fix: replace "" in Times New Roman with Song
             move this to docx-ts run normalize later, if possible :)

             set font of \u201c and \u201d explicitly in order to save it as <w:rPr/><w:t>\u201c</w:t>
             instead of <w:rPr/><w:t>\u201c测试</w:t>
     */
    const replacements = config && config.postProcessing && config.postProcessing.textReplacements;
    if (replacements)
    {
        for (const replacement of replacements)
        {
            grafted = grafted.replace(replacement.find, replacement.replace);
        }
    }
    else
    {
        const reg_left = `<w:rPr/><w:t>\u201c</w:t>`;
        grafted = grafted.replace(reg_left,`<w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>\u201c</w:t>`);

        const reg_right = `<w:rPr/><w:t>\u201d</w:t>`;
        grafted = grafted.replace(reg_right,`<w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>\u201d</w:t>`);
    }

    input.Save({ content: grafted, name: "document" });

    // caution! the order matters
    // if you inject package first, you will lost original user style
    await InjectPackageNative({ input, standard });
}
