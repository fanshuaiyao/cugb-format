import { Secretary, IInsight } from "./secretary";
import { UserStyle } from "docx-style";
import { PlainText, Element } from "xml-util";
import { DocxNumbering } from "docx-numbering";
import { insight_type } from "./common/type";

export interface IClassificationConfig
{
    pureChapters: Array<string>;
    pureSections: Array<string>;
    captionPrefixes: { [index: string]: string };
    headingPatterns: {
        chapter: Array<string>;
        section: Array<string>;
        subsection: Array<string>;
    };
}

const DefaultCaptionTable: { [index: string]: insight_type } = {
    "图": "figure_caption",
    "表": "table_caption",
    "公式": "formula_caption"
};

const NormalTable: { [index: string]: insight_type } = {
    '"name":"w:drawing"': "figure",
    '"name":"m:oMath"': "formula"
};

const DefaultPureChapters = ["参考文献", "结论", "致谢", "附录", "总结与展望"];
const DefaultPureSections = ["结论", "总结", "论文总结", "本人工作内容", "展望"];

const DefaultHeadingPatterns = {
    chapter: ["^\\d+\\s+.+$", "^第.+章\\s+.+$", "^#\\s*.+$"],
    section: ["^\\d+\\.\\d+\\s+.+$", "^##\\s*.+$"],
    subsection: ["^\\d+\\.\\d+\\..+\\s+.+$", "^###\\s*.+$"]
};

export class UserSecretary extends Secretary
{
    private m_InsightTable: { [index: string]: Function } = {
        "caption": this.CaptionType.bind(this),
        "normal": this.NormalType.bind(this),
        "list": this.ListType.bind(this),
        "chapter_title": this.ChapterType.bind(this),
        "section_title":this.SectionType.bind(this)
    };

    private m_DocxNumbering: DocxNumbering;
    private m_PureChapterSet: Set<string>;
    private m_PureSectionSet: Set<string>;
    private m_CaptionTable: { [index: string]: string };
    private m_HeadingPatterns: { chapter: Array<RegExp>; section: Array<RegExp>; subsection: Array<RegExp> };
    private m_OutlineLevelMap: { [index: string]: string };
    private m_DecimalPatterns: { [index: string]: string };

    constructor(classificationConfig?: IClassificationConfig,
                outlineLevelMap?: { [index: string]: string },
                decimalPatterns?: { [index: string]: string })
    {
        super();
        const pureChapters = classificationConfig ? classificationConfig.pureChapters : DefaultPureChapters;
        const pureSections = classificationConfig ? classificationConfig.pureSections : DefaultPureSections;
        this.m_PureChapterSet = new Set<string>(pureChapters);
        this.m_PureSectionSet = new Set<string>(pureSections);
        this.m_CaptionTable = classificationConfig ? classificationConfig.captionPrefixes : (DefaultCaptionTable as { [index: string]: string });

        const patterns = classificationConfig ? classificationConfig.headingPatterns : DefaultHeadingPatterns;
        this.m_HeadingPatterns = {
            chapter: patterns.chapter.map(p => new RegExp(p)),
            section: patterns.section.map(p => new RegExp(p)),
            subsection: patterns.subsection.map(p => new RegExp(p))
        };

        this.m_OutlineLevelMap = outlineLevelMap || null;
        this.m_DecimalPatterns = decimalPatterns || null;
    }

    public UnderstandStyle(styles_xml: string)
    {
        this.m_DocxStyle = new UserStyle(styles_xml, this.m_OutlineLevelMap);
        return this;
    }

    public UnderstandNumbering(numbering_xml: string)
    {
        this.m_DocxNumbering = new DocxNumbering(numbering_xml, this.m_DecimalPatterns);
        return this;
    }

    private CaptionType(e: Element): insight_type
    {
        for (const key in this.m_CaptionTable)
        {
            if (PlainText(e).startsWith(key))
            {
                return this.m_CaptionTable[key] as insight_type;
            }
        }
        return "normal";
    }

    private ChapterType(e: Element): insight_type
    {
        const text = PlainText(e);
        if (this.m_PureChapterSet.has(text))
        {
            return "pure_chapter";
        }
        else
        {
            return "chapter_title";
        }
    }

    private SectionType(e: Element): insight_type
    {
        const text = PlainText(e);
        if (this.m_PureSectionSet.has(text))
        {
            return "pure_section";
        }
        else
        {
            return "section_title";
        }
    }

    private NormalType(e: Element): insight_type
    {
        for (const key in NormalTable)
        {
            // TODO: improve the performace with some deep-search lib!
            if (JSON.stringify(e).includes(key))
            {
                if (NormalTable[key] === "formula")
                {
                    if (PlainText(e) === "")
                    {
                        return "formula";
                    }
                    else
                    {
                        return "normal";
                    }
                }
                return NormalTable[key];
            }
        }

        const text = PlainText(e);
        if (this.m_HeadingPatterns.chapter.some(p => p.test(text)))
        {
            return "chapter_title";
        }
        else if (this.m_HeadingPatterns.section.some(p => p.test(text)))
        {
            return "section_title";
        }
        else if (this.m_HeadingPatterns.subsection.some(p => p.test(text)))
        {
            return "subsection_title";
        }
        else if (this.m_PureChapterSet.has(text))
        {
            return "pure_chapter";
        }
        return "normal";
    }

    private ListType(e: Element): insight_type
    {
        try
        {
            const numPr = e.elements
                .find(e => e.name === "w:pPr").elements
                .find(e => e.name === "w:numPr");

            const level = numPr.elements.find(e => e.name === "w:ilvl").attributes["w:val"] as string;
            const id = numPr.elements.find(e => e.name === "w:numId").attributes["w:val"] as string;
            const type = this.m_DocxNumbering.NumberingType({ level, id });

            return type;

        }
        catch (error)
        {
            return "normal";
        }
    }

    private UpdateInsight(insight: IInsight, e: Element): IInsight
    {
        if (insight.type in this.m_InsightTable)
        {
            insight.type = this.m_InsightTable[insight.type](e);
        }
        return insight;
    }

    public Insight(e: Element): IInsight
    {
        const insight = super.StructureInsight(e);
        return this.UpdateInsight(insight, e);
    }
}