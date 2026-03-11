import { FileToElement, Element, ExtractElement } from "xml-util";

const DefaultDecimalPatterns: { [index: string]: string } = {
    "[%1]": "reference",
    "%1、": "item",
    "(%1)": "subitem"
};

export class DocxNumbering
{
    protected m_Numbering: Element;
    private m_DecimalPatterns: { [index: string]: string };

    constructor(numbering_xml: string, decimalPatterns?: { [index: string]: string })
    {
        this.m_Numbering = FileToElement(numbering_xml);
        this.m_DecimalPatterns = decimalPatterns || DefaultDecimalPatterns;
    }

    public NumberingType({ level, id }: { level: string, id: string })
    {
        try
        {
            const num_instance = ExtractElement({ name: "w:num", prop: "w:numId", value: id, e: this.m_Numbering });
            const abstract_id = num_instance.elements.find(e => e.name === "w:abstractNumId").attributes["w:val"] as string;
            const num_abstract = ExtractElement({ name: "w:abstractNum", prop: "w:abstractNumId", value: abstract_id, e: this.m_Numbering });
            const level_info = ExtractElement({ name: "w:lvl", prop: "w:ilvl", value: level, e: num_abstract });
            const text = level_info.elements.find(e => e.name === "w:lvlText").attributes["w:val"] as string;
            const format = level_info.elements.find(e => e.name === "w:numFmt").attributes["w:val"] as string;

            if (format === "decimal")
            {
                if (text in this.m_DecimalPatterns)
                {
                    return this.m_DecimalPatterns[text];
                }
                return "normal";
            }
        }
        catch (error)
        {
            return "normal";
        }
    }
}