import React, { Component } from 'react';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import styles from "./cmdbar.module.css";
import { Format } from './command';
import { IFormatConfigData } from '../config-selector/ConfigSelector';

const cmd_button_styles = { root: { backgroundColor: "white", padding: "8px" } };

// OLE2 magic number for .doc files (D0 CF 11 E0)
const DOC_MAGIC = [0xD0, 0xCF, 0x11, 0xE0];

function isDocFile(buffer: ArrayBuffer): boolean
{
    if (buffer.byteLength < 4) return false;
    const view = new Uint8Array(buffer, 0, 4);
    return view[0] === DOC_MAGIC[0] && view[1] === DOC_MAGIC[1] &&
           view[2] === DOC_MAGIC[2] && view[3] === DOC_MAGIC[3];
}

interface ICommandBarProps
{
    config?: IFormatConfigData | null;
    customTemplateBuffer?: ArrayBuffer | null;
}

class CommandBar extends Component<ICommandBarProps>
{
    OnClickUpload()
    {
        const upload = document.getElementById("upload") as HTMLInputElement;
        upload.click();
    }

    OnUploadFile(e: any)
    {
        const files = (e.target as HTMLInputElement).files as FileList;
        if (files.length === 1)
        {
            const file = files[0];
            const file_name = file.name;
            console.log(`upload ${file_name}...`);

            if (file_name.endsWith(".doc") && !file_name.endsWith(".docx"))
            {
                (document.getElementById("form") as HTMLFormElement).reset();
                alert("检测到.doc格式文件，请先在Word中将其另存为.docx格式后再上传。");
                return;
            }

            if(!file_name.endsWith(".docx"))
            {
                (document.getElementById("form") as HTMLFormElement).reset();
                alert("请确认上传的是docx文档");
                return;
            }
            const reader = new FileReader();
            reader.onload = async () =>
            {
                try
                {
                    const buffer = reader.result as ArrayBuffer;

                    // Double-check via magic number in case extension is wrong
                    if (isDocFile(buffer))
                    {
                        alert("检测到旧版.doc格式文件，请先在Word中将其另存为.docx格式后再上传。");
                        (document.getElementById("form") as HTMLFormElement).reset();
                        return;
                    }

                    const { config, customTemplateBuffer } = this.props;
                    await Format(buffer, file_name, config || undefined, customTemplateBuffer || undefined);
                }
                catch(error)
                {
                    alert("排版失败，请按照使用手册说明来使用。");
                }
                (document.getElementById("form") as HTMLFormElement).reset();
            };
            reader.readAsArrayBuffer(file);
        }
    }

    render()
    {
        return (
            <div className={styles.cmdbar}>
                <form id="form">
                    <input type="file" id="upload" onChange={this.OnUploadFile.bind(this)} style={{ display: "none" }} />
                </form>
                <CommandBarButton
                    iconProps={{ iconName: 'OpenFolderHorizontal' }}
                    text="打开"
                    styles={cmd_button_styles}
                    onClick={this.OnClickUpload.bind(this)}
                />
            </div>
        );
    }
}

export { CommandBar };
