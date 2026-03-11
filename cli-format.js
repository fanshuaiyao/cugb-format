#!/usr/bin/env node

/**
 * CLI 后门接口：通过文件路径直接排版
 *
 * 用法：
 *   node cli-format.js <输入文件路径> [输出文件路径] [配置文件路径]
 *
 * 示例：
 *   node cli-format.js ./my-thesis.docx
 *   node cli-format.js ./my-thesis.docx ./output.docx
 *   node cli-format.js ./my-thesis.docx ./output.docx ./my-config.json
 */

const fs = require("fs");
const path = require("path");

async function main()
{
    const args = process.argv.slice(2);

    if (args.length === 0)
    {
        console.log("用法: node cli-format.js <输入.docx> [输出.docx] [配置.json]");
        console.log("");
        console.log("示例:");
        console.log("  node cli-format.js thesis.docx");
        console.log("  node cli-format.js thesis.docx formatted.docx");
        console.log("  node cli-format.js thesis.docx formatted.docx config.json");
        process.exit(1);
    }

    const inputPath = path.resolve(args[0]);
    const outputPath = args[1]
        ? path.resolve(args[1])
        : inputPath.replace(/\.docx$/i, ".formatted.docx");
    const configPath = args[2] ? path.resolve(args[2]) : null;

    // 检查输入文件
    if (!fs.existsSync(inputPath))
    {
        console.error(`错误: 找不到输入文件 ${inputPath}`);
        process.exit(1);
    }

    if (!inputPath.toLowerCase().endsWith(".docx"))
    {
        console.error("错误: 输入文件必须是 .docx 格式");
        process.exit(1);
    }

    // 加载配置（可选）
    let config = undefined;
    if (configPath)
    {
        if (!fs.existsSync(configPath))
        {
            console.error(`错误: 找不到配置文件 ${configPath}`);
            process.exit(1);
        }
        try
        {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            console.log(`使用配置: ${configPath}`);
        }
        catch (e)
        {
            console.error("错误: 配置文件 JSON 格式无效");
            process.exit(1);
        }
    }

    console.log(`输入: ${inputPath}`);
    console.log(`输出: ${outputPath}`);

    try
    {
        // 加载依赖（需要先 build 各包）
        const { FormatPackageNative, DocxPackage, DocxIsValid } = require("docx-driver");

        // 加载标准模板
        const standardDocxPath = path.resolve(__dirname, "packages/common/samples/standard.docx");
        let standardBuffer;

        if (fs.existsSync(standardDocxPath))
        {
            standardBuffer = toArrayBuffer(fs.readFileSync(standardDocxPath));
        }
        else
        {
            // 回退：从 auto-format 的 base64 资源加载
            try
            {
                const { standard_base64 } = require("./packages/auto-format/src/asset/standard_base64");
                const { decode } = require("base64-arraybuffer");
                standardBuffer = decode(standard_base64);
                console.log("使用内嵌 base64 标准模板");
            }
            catch (e)
            {
                console.error("错误: 找不到标准模板文件，请确保项目已构建");
                process.exit(1);
            }
        }

        const standard = await new DocxPackage().FromArrayBuffer(standardBuffer);

        // 加载用户文档
        const userBuffer = toArrayBuffer(fs.readFileSync(inputPath));
        const user = await new DocxPackage().FromArrayBuffer(userBuffer);

        // 校验
        if (!await DocxIsValid(user))
        {
            console.error("错误: 文档格式不符合要求（可能包含目录域代码），请按使用手册说明来输入");
            process.exit(1);
        }

        // 排版
        console.log("正在排版...");
        await FormatPackageNative({ standard, input: user, config });

        // 输出
        const resultBuffer = await user.ToArrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(resultBuffer));

        console.log(`完成! 输出文件: ${outputPath}`);
    }
    catch (error)
    {
        console.error("排版失败:", error.message || error);
        process.exit(1);
    }
}

function toArrayBuffer(buf)
{
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; i++)
    {
        view[i] = buf[i];
    }
    return ab;
}

main();
