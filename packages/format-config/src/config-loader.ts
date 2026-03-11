import { ThesisFormatConfig } from "./interfaces";

const requiredKeys: Array<keyof ThesisFormatConfig> = [
    "meta", "templateFile", "styleNameMap", "outlineLevelMap",
    "classification", "frontMatter", "sections", "numbering", "postProcessing"
];

export function validateConfig(config: any): config is ThesisFormatConfig
{
    if (!config || typeof config !== "object")
    {
        return false;
    }

    for (const key of requiredKeys)
    {
        if (!(key in config))
        {
            return false;
        }
    }

    const meta = config.meta;
    if (!meta || !meta.id || !meta.name || !meta.university || !meta.locale)
    {
        return false;
    }

    if (typeof config.templateFile !== "string")
    {
        return false;
    }

    if (!config.styleNameMap || typeof config.styleNameMap !== "object")
    {
        return false;
    }

    if (!config.outlineLevelMap || typeof config.outlineLevelMap !== "object")
    {
        return false;
    }

    const cls = config.classification;
    if (!cls || !Array.isArray(cls.pureChapters) || !Array.isArray(cls.pureSections) ||
        !cls.captionPrefixes || !cls.headingPatterns || !Array.isArray(cls.headingStripPatterns))
    {
        return false;
    }

    const fm = config.frontMatter;
    if (!fm || !fm.metaSentinels || !fm.abstractBoundaries || !fm.keywordsPrefixes || !fm.defaults)
    {
        return false;
    }

    const sec = config.sections;
    if (!sec || !sec.sectionMap || !sec.sectionStyleKeys)
    {
        return false;
    }

    if (!config.numbering || !config.numbering.decimalPatterns)
    {
        return false;
    }

    if (!config.postProcessing || !Array.isArray(config.postProcessing.textReplacements))
    {
        return false;
    }

    return true;
}

export function parseConfig(json: string): ThesisFormatConfig
{
    const parsed = JSON.parse(json);
    if (!validateConfig(parsed))
    {
        throw new Error("Invalid thesis format configuration");
    }
    return parsed;
}
