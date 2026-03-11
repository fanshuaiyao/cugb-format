import { Element } from "xml-util";
import { Secretary, IInsight } from "./secretary";
import { StdStyle } from "docx-style";

export class StdSecretary extends Secretary
{
    private m_StyleNameMap: { [index: string]: string };

    constructor(styleNameMap?: { [index: string]: string })
    {
        super();
        this.m_StyleNameMap = styleNameMap || null;
    }

    public UnderstandStyle(styles_xml: string)
    {
        this.m_DocxStyle = new StdStyle(styles_xml, this.m_StyleNameMap);
        return this;
    }

    public Insight(e: Element): IInsight
    {
        return super.StructureInsight(e);
    }
}