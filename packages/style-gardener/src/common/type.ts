import { XmlComponent } from "docx-ts";
import { IStyleSheetItem, IStyleSheet } from "style-sheet";
import { UserSecretary } from "docx-secretary";
import { ISection } from "xml-util";

export interface IComponentGardener
{
    Graft({ old, item, type, headingStripPatterns }: { old?: XmlComponent, item?: IStyleSheetItem, type?: string, headingStripPatterns?: Array<string> }): XmlComponent;
}

export interface IAbstractTocGardener
{
    Graft({ style_sheet, section, frontMatter, sectionStyleKey, sectionHeaderId }:
        { style_sheet: IStyleSheet, section: ISection, frontMatter?: any, sectionStyleKey?: string, sectionHeaderId?: string }): Array<XmlComponent>;
}

export interface IMainGardener
{
    Graft({ style_sheet, section, secretary, sectionStyleKey, sectionHeaderId, headingStripPatterns }:
        { style_sheet: IStyleSheet, section: ISection, secretary: UserSecretary,
          sectionStyleKey?: string, sectionHeaderId?: string, headingStripPatterns?: Array<string> }): Array<XmlComponent>
}
