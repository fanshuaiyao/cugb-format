import { IComponentGardener } from "../../common/type";
import { XmlComponent, Clone, Paragraph, ParagraphProperty, Convert } from "docx-ts";
import { IStyleSheetItem } from "style-sheet";
import { Element, TextToParagraph, PlainText } from "xml-util";

const DefaultStripPatterns = [/^.+\..+\..+\s+/,/^.+\..+\s+/,/^\d+\s*/, /^第.+章\s*/, /^#\s*/];

export const DefaultGardener: IComponentGardener =
{
    Graft({ old, item, type, headingStripPatterns }: { old: XmlComponent, item: IStyleSheetItem, type: string, headingStripPatterns?: Array<string> }): XmlComponent
    {
        try
        {
            let paragraph: Paragraph = null;
            if (type.endsWith("_title"))
            {
                const old_element = old.PrepareXml();

                let text = PlainText(old_element);

                const patterns = headingStripPatterns
                    ? headingStripPatterns.map(p => new RegExp(p))
                    : DefaultStripPatterns;

                for(const pattern of patterns)
                {
                    if(pattern.test(text))
                    {
                        text = text.replace(pattern,"").trimLeft();
                        break;
                    }
                }

                const new_element = TextToParagraph(text);
                paragraph = Convert(new_element) as Paragraph;
            }
            else
            {
                paragraph = Clone(old) as Paragraph;
            }
            const default_style = item.style as Element;
            const prop = Convert(default_style) as ParagraphProperty;
            paragraph.UpdateProperty(prop);
            return paragraph;
        }
        catch (error)
        {
            return Clone(old) as Paragraph;
        }
    }
}
