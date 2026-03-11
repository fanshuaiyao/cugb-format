import { validateConfig, parseConfig, getPreset, listPresets, getDefaultPreset } from "../src/index";

describe("format-config", () =>
{
    describe("validateConfig", () =>
    {
        it("should validate the BUAA preset", () =>
        {
            const config = getPreset("buaa-undergraduate");
            expect(validateConfig(config)).toBe(true);
        });

        it("should reject null", () =>
        {
            expect(validateConfig(null)).toBe(false);
        });

        it("should reject empty object", () =>
        {
            expect(validateConfig({})).toBe(false);
        });

        it("should reject config missing required keys", () =>
        {
            expect(validateConfig({ meta: { id: "test" } })).toBe(false);
        });

        it("should reject config with invalid meta", () =>
        {
            const config = getPreset("buaa-undergraduate");
            const invalid = { ...config, meta: { id: "test" } };
            expect(validateConfig(invalid)).toBe(false);
        });
    });

    describe("parseConfig", () =>
    {
        it("should parse valid JSON config", () =>
        {
            const config = getPreset("buaa-undergraduate");
            const json = JSON.stringify(config);
            const parsed = parseConfig(json);
            expect(parsed.meta.id).toBe("buaa-undergraduate");
        });

        it("should throw on invalid JSON config", () =>
        {
            expect(() => parseConfig("{}")).toThrow("Invalid thesis format configuration");
        });

        it("should throw on malformed JSON", () =>
        {
            expect(() => parseConfig("{invalid}")).toThrow();
        });
    });

    describe("presets", () =>
    {
        it("should list available presets", () =>
        {
            const presets = listPresets();
            expect(presets.length).toBeGreaterThanOrEqual(1);
            expect(presets[0].id).toBe("buaa-undergraduate");
            expect(presets[0].university).toBe("北京航空航天大学");
        });

        it("should get BUAA preset by id", () =>
        {
            const config = getPreset("buaa-undergraduate");
            expect(config).not.toBeNull();
            expect(config.meta.name).toBe("北航本科毕业论文");
        });

        it("should return null for unknown preset", () =>
        {
            const config = getPreset("nonexistent");
            expect(config).toBeNull();
        });

        it("should return default preset", () =>
        {
            const config = getDefaultPreset();
            expect(config.meta.id).toBe("buaa-undergraduate");
        });
    });

    describe("BUAA preset content", () =>
    {
        const config = getPreset("buaa-undergraduate");

        it("should have correct styleNameMap entries", () =>
        {
            expect(config.styleNameMap["heading 1"]).toBe("chapter_title");
            expect(config.styleNameMap["论文正文"]).toBe("normal");
            expect(config.styleNameMap["图片题注"]).toBe("figure_caption");
        });

        it("should have correct outlineLevelMap", () =>
        {
            expect(config.outlineLevelMap["0"]).toBe("chapter_title");
            expect(config.outlineLevelMap["1"]).toBe("section_title");
            expect(config.outlineLevelMap["2"]).toBe("subsection_title");
        });

        it("should have correct classification", () =>
        {
            expect(config.classification.pureChapters).toContain("参考文献");
            expect(config.classification.captionPrefixes["图"]).toBe("figure_caption");
            expect(config.classification.headingPatterns.chapter.length).toBe(3);
        });

        it("should have correct frontMatter config", () =>
        {
            expect(config.frontMatter.metaSentinels.title).toBe("论文题目：");
            expect(config.frontMatter.abstractBoundaries.cn.start).toBe("摘要");
            expect(config.frontMatter.keywordsPrefixes.en).toBe("Keywords:");
        });

        it("should have correct sections config", () =>
        {
            expect(config.sections.sectionMap["abstract_toc"]).toBe(0);
            expect(config.sections.sectionMap["main"]).toBe(1);
            expect(config.sections.sectionStyleKeys["main"].headerId).toBe("header2");
        });

        it("should have correct numbering config", () =>
        {
            expect(config.numbering.decimalPatterns["[%1]"]).toBe("reference");
            expect(config.numbering.decimalPatterns["%1、"]).toBe("item");
        });

        it("should have correct postProcessing config", () =>
        {
            expect(config.postProcessing.textReplacements.length).toBe(2);
        });
    });
});
