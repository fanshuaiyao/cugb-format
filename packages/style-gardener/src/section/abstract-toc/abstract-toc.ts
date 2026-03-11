import { IAbstractTocGardener } from "../../common/type";
import { IStyleSheet } from "style-sheet";
import { XmlComponent } from "docx-ts";
import { TocGardener } from "./toc";
import { ISection, PlainText, Element } from "xml-util";
import { TitleGardener } from "./title";
import { EntityGardener } from "./entity";
import { NameGardener } from "./name";
import { SectionGardener } from "./section";
import { LiteralGardener } from "./literal";
import { AbstractGardener } from "./abstract";
import { KeywordsGardener } from "./keywords";

export interface IFrontMatterConfig
{
    metaSentinels?: {
        title: string;
        author: string;
        tutor: string;
    };
    abstractBoundaries?: {
        cn: { start: string; end: string };
        en: { start: string; end: string };
    };
    keywordsPrefixes?: {
        cn: string;
        en: string;
    };
    defaults?: {
        title_cn: string;
        title_en: string;
        author_cn: string;
        author_en: string;
        tutor_cn: string;
        tutor_en: string;
    };
}

const DefaultFrontMatter: IFrontMatterConfig = {
    metaSentinels: {
        title: "论文题目：",
        author: "学生：",
        tutor: "指导教师："
    },
    abstractBoundaries: {
        cn: { start: "摘要", end: "关键字：" },
        en: { start: "Abstract", end: "Keywords:" }
    },
    keywordsPrefixes: {
        cn: "关键字：",
        en: "Keywords:"
    },
    defaults: {
        title_cn: "未识别的标题",
        title_en: "unknown title",
        author_cn: "未识别的作者",
        author_en: "unknown author",
        tutor_cn: "未识别的指导教师",
        tutor_en: "unknown tutor"
    }
};

type IMeta = {
    "title_cn": string, "title_en": string,
    "author_cn": string, "author_en": string,
    "tutor_cn": string, "tutor_en": string
};

function ExtractMeta(section: ISection, fm: IFrontMatterConfig): IMeta
{
    const defaults = fm.defaults || DefaultFrontMatter.defaults;
    const sentinels = fm.metaSentinels || DefaultFrontMatter.metaSentinels;

    const meta: IMeta = {
        "title_cn": defaults.title_cn, "title_en": defaults.title_en,
        "author_cn": defaults.author_cn, "author_en": defaults.author_en,
        "tutor_cn": defaults.tutor_cn, "tutor_en": defaults.tutor_en
    };

    try
    {
        const title_index = section.findIndex(e => PlainText(e).startsWith(sentinels.title));
        if (title_index !== -1)
        {
            meta["title_cn"] = PlainText(section[title_index + 1]).trim();
            meta["title_en"] = PlainText(section[title_index + 2]).trim();
        }

        const author_index = section.findIndex(e => PlainText(e).startsWith(sentinels.author));
        if (author_index !== -1)
        {
            meta["author_cn"] = PlainText(section[author_index + 1]).trim();
            meta["author_en"] = PlainText(section[author_index + 2]).trim();
        }

        const tutor_index = section.findIndex(e => PlainText(e).startsWith(sentinels.tutor));
        if (tutor_index !== -1)
        {
            meta["tutor_cn"] = PlainText(section[tutor_index + 1]).trim();
            meta["tutor_en"] = PlainText(section[tutor_index + 2]).trim();
        }
    }
    catch (error)
    {

    }


    return meta;
}

function ExtractAbstract({ section, start, end }: { section: ISection, start: string, end: string }): Array<Element>
{
    try
    {
        // ignore user typed abstract literal
        const __start = section.findIndex(e => PlainText(e) === start) + 1;

        // TODO:the empty line before keywords should be supplyed by user?
        const __end = section.findIndex(e => PlainText(e).startsWith(end));
        const abstract_cn = section.slice(__start, __end);
        return abstract_cn;
    }
    catch (error)
    {
        return null;
    }
}

function ExtractKeywords({ section, start }: { section: ISection, start: string }): string
{
    try
    {
        const e = section.find(e => PlainText(e).startsWith(start));
        const keywords = PlainText(e).replace(start, "");
        return keywords;
    }
    catch (error)
    {
        return null;
    }
}

export const AbstractTocGardener: IAbstractTocGardener =
{
    Graft({ style_sheet, section, frontMatter, sectionStyleKey, sectionHeaderId }:
        { style_sheet: IStyleSheet, section: ISection, frontMatter?: IFrontMatterConfig, sectionStyleKey?: string, sectionHeaderId?: string }): Array<XmlComponent>
    {
        const fm = frontMatter || DefaultFrontMatter;
        const boundaries = fm.abstractBoundaries || DefaultFrontMatter.abstractBoundaries;
        const kwPrefixes = fm.keywordsPrefixes || DefaultFrontMatter.keywordsPrefixes;
        const secStyleKey = sectionStyleKey || "section0";
        const secHeaderId = sectionHeaderId || "header1";

        //
        const meta = ExtractMeta(section, fm);

        //
        const title_cn = TitleGardener.Graft({ item: style_sheet.Get("title_cn"), title: meta.title_cn });
        const author_cn = EntityGardener.Graft({ item: style_sheet.Get("author_cn") });
        const author_name_cn = NameGardener.Graft({ item: style_sheet.Get("author_name_cn"), name: meta.author_cn });
        const tutor_cn = EntityGardener.Graft({ item: style_sheet.Get("tutor_cn") });
        const tutor_name_cn = NameGardener.Graft({ item: style_sheet.Get("tutor_name_cn"), name: meta.tutor_cn });
        const literal_abstract_cn = LiteralGardener.Graft({ item: style_sheet.Get("literal_abstract_cn") });
        const abstract_cn = AbstractGardener.Graft({
            abstract: ExtractAbstract({ section, start: boundaries.cn.start, end: boundaries.cn.end }),
            item: style_sheet.Get("normal")
        });
        const literal_keywords_cn = LiteralGardener.Graft({ item: style_sheet.Get("literal_keywords_cn") });
        const keywords_cn = KeywordsGardener.Graft({
            keywords: ExtractKeywords({ section, start: kwPrefixes.cn }),
            item: style_sheet.Get("normal")
        });

        //
        const title_en = TitleGardener.Graft({ item: style_sheet.Get("title_en"), title: meta.title_en });
        const author_en = EntityGardener.Graft({ item: style_sheet.Get("author_en") });
        const author_name_en = NameGardener.Graft({ item: style_sheet.Get("author_name_en"), name: meta.author_en });
        const tutor_en = EntityGardener.Graft({ item: style_sheet.Get("tutor_en") });
        const tutor_name_en = NameGardener.Graft({ item: style_sheet.Get("tutor_name_en"), name: meta.tutor_en });
        const literal_abstract_en = LiteralGardener.Graft({ item: style_sheet.Get("literal_abstract_en") });
        const abstract_en = AbstractGardener.Graft({
            abstract: ExtractAbstract({ section, start: boundaries.en.start, end: boundaries.en.end }),
            item: style_sheet.Get("normal")
        });
        const literal_keywords_en = LiteralGardener.Graft({ item: style_sheet.Get("literal_keywords_en") });
        const keywords_en = KeywordsGardener.Graft({
            keywords: ExtractKeywords({ section, start: kwPrefixes.en }),
            item: style_sheet.Get("normal")
        });

        //
        const toc = TocGardener.Graft({ item: style_sheet.Get("toc") });
        const abstract_toc_section = SectionGardener.Graft({ item: style_sheet.Get(secStyleKey), id: secHeaderId });

        //
        const grafted = [
            title_cn,
            author_cn,
            author_name_cn,
            tutor_cn,
            tutor_name_cn,
            literal_abstract_cn,
            ...abstract_cn,
            literal_keywords_cn,
            keywords_cn,
            title_en,
            author_en,
            author_name_en,
            tutor_en,
            tutor_name_en,
            literal_abstract_en,
            ...abstract_en,
            literal_keywords_en,
            keywords_en,
            toc,
            abstract_toc_section
        ].filter(e => e !== null);
        return grafted;
    }
}
