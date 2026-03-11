import { FormatPackageNative, DocxPackage, DocxIsValid, IFormatConfig } from "docx-driver";
import { decode } from "base64-arraybuffer";
import { standard_base64 } from "../../asset/standard_base64";
import save from "save-file/browser";

// Cache for standard templates keyed by template identifier
const standardCache: { [key: string]: DocxPackage } = {};

export async function Format(user_buffer: ArrayBuffer, file_name: string, config?: IFormatConfig, customTemplateBuffer?: ArrayBuffer)
{
    const templateKey = customTemplateBuffer ? "custom" : "default";

    if (!standardCache[templateKey])
    {
        if (customTemplateBuffer)
        {
            standardCache[templateKey] = await new DocxPackage().FromArrayBuffer(customTemplateBuffer);
        }
        else
        {
            standardCache[templateKey] = await new DocxPackage().FromArrayBuffer(decode(standard_base64) as ArrayBuffer);
        }
    }

    const standard = standardCache[templateKey];
    const user = await new DocxPackage().FromArrayBuffer(user_buffer);
    if(!await DocxIsValid(user))
    {
        alert("排版失败，请按照使用手册说明来输入。");
        return;
    }

    await FormatPackageNative({ standard, input: user, config });
    await save(await user.ToArrayBuffer(), `${file_name.replace(".docx", "")}.formatted.docx`);
}

export function clearTemplateCache()
{
    delete standardCache["custom"];
}
