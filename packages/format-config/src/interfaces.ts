export interface ThesisFormatConfig
{
    meta: MetaConfig;
    templateFile: string;
    styleNameMap: { [index: string]: string };
    outlineLevelMap: { [index: string]: string };
    classification: ClassificationConfig;
    frontMatter: FrontMatterConfig;
    sections: SectionsConfig;
    numbering: NumberingConfig;
    postProcessing: PostProcessingConfig;
}

export interface MetaConfig
{
    id: string;
    name: string;
    university: string;
    locale: string;
}

export interface ClassificationConfig
{
    pureChapters: Array<string>;
    pureSections: Array<string>;
    captionPrefixes: { [index: string]: string };
    headingPatterns: {
        chapter: Array<string>;
        section: Array<string>;
        subsection: Array<string>;
    };
    headingStripPatterns: Array<string>;
}

export interface FrontMatterConfig
{
    metaSentinels: {
        title: string;
        author: string;
        tutor: string;
    };
    abstractBoundaries: {
        cn: { start: string; end: string };
        en: { start: string; end: string };
    };
    keywordsPrefixes: {
        cn: string;
        en: string;
    };
    defaults: {
        title_cn: string;
        title_en: string;
        author_cn: string;
        author_en: string;
        tutor_cn: string;
        tutor_en: string;
    };
}

export interface SectionsConfig
{
    sectionMap: { [index: string]: number };
    sectionStyleKeys: {
        [index: string]: {
            styleKey: string;
            headerId: string;
        };
    };
}

export interface NumberingConfig
{
    decimalPatterns: { [index: string]: string };
}

export interface PostProcessingConfig
{
    textReplacements: Array<{
        find: string;
        replace: string;
    }>;
}
