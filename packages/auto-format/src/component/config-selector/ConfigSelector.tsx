import React, { Component } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import styles from "./config-selector.module.css";

export interface IFormatConfigData
{
    styleNameMap?: { [index: string]: string };
    outlineLevelMap?: { [index: string]: string };
    classification?: any;
    frontMatter?: any;
    sections?: any;
    numbering?: any;
    postProcessing?: any;
}

interface IConfigSelectorState
{
    selectedPreset: string;
    customConfig: IFormatConfigData | null;
    customTemplateBuffer: ArrayBuffer | null;
    customConfigName: string;
    customTemplateName: string;
}

interface IConfigSelectorProps
{
    onConfigChange: (config: IFormatConfigData | null, templateBuffer: ArrayBuffer | null) => void;
}

const presetOptions: IDropdownOption[] = [
    { key: "buaa-undergraduate", text: "北航本科毕业论文" }
];

const btn_styles = { root: { backgroundColor: "white", padding: "8px" } };

class ConfigSelector extends Component<IConfigSelectorProps, IConfigSelectorState>
{
    constructor(props: IConfigSelectorProps)
    {
        super(props);
        this.state = {
            selectedPreset: "buaa-undergraduate",
            customConfig: null,
            customTemplateBuffer: null,
            customConfigName: "",
            customTemplateName: ""
        };
    }

    OnPresetChange = (_event: any, option?: IDropdownOption) =>
    {
        if (option)
        {
            this.setState({
                selectedPreset: option.key as string,
                customConfig: null,
                customConfigName: ""
            });
            this.props.onConfigChange(null, null);
        }
    }

    OnClickUploadConfig = () =>
    {
        const upload = document.getElementById("config-upload") as HTMLInputElement;
        upload.click();
    }

    OnUploadConfig = (e: any) =>
    {
        const files = (e.target as HTMLInputElement).files as FileList;
        if (files.length === 1)
        {
            const file = files[0];
            if (!file.name.endsWith(".json"))
            {
                alert("请上传JSON格式的配置文件");
                return;
            }
            const reader = new FileReader();
            reader.onload = () =>
            {
                try
                {
                    const config = JSON.parse(reader.result as string) as IFormatConfigData;
                    this.setState({ customConfig: config, customConfigName: file.name });
                    this.props.onConfigChange(config, this.state.customTemplateBuffer);
                }
                catch (error)
                {
                    alert("配置文件解析失败，请检查JSON格式是否正确");
                }
            };
            reader.readAsText(file);
        }
    }

    OnClickUploadTemplate = () =>
    {
        const upload = document.getElementById("template-upload") as HTMLInputElement;
        upload.click();
    }

    OnUploadTemplate = (e: any) =>
    {
        const files = (e.target as HTMLInputElement).files as FileList;
        if (files.length === 1)
        {
            const file = files[0];
            if (!file.name.endsWith(".docx"))
            {
                alert("请上传docx格式的模板文件");
                return;
            }
            const reader = new FileReader();
            reader.onload = () =>
            {
                const buffer = reader.result as ArrayBuffer;
                this.setState({ customTemplateBuffer: buffer, customTemplateName: file.name });
                this.props.onConfigChange(this.state.customConfig, buffer);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    render()
    {
        return (
            <div className={styles.configSelector}>
                <Dropdown
                    label="论文格式预设"
                    selectedKey={this.state.selectedPreset}
                    options={presetOptions}
                    onChange={this.OnPresetChange}
                    styles={{ root: { minWidth: 200 } }}
                />
                <div className={styles.uploadRow}>
                    <input type="file" id="config-upload" accept=".json" onChange={this.OnUploadConfig} style={{ display: "none" }} />
                    <CommandBarButton
                        iconProps={{ iconName: 'Settings' }}
                        text={this.state.customConfigName || "自定义配置"}
                        styles={btn_styles}
                        onClick={this.OnClickUploadConfig}
                    />
                    <input type="file" id="template-upload" accept=".docx" onChange={this.OnUploadTemplate} style={{ display: "none" }} />
                    <CommandBarButton
                        iconProps={{ iconName: 'PageAdd' }}
                        text={this.state.customTemplateName || "自定义模板"}
                        styles={btn_styles}
                        onClick={this.OnClickUploadTemplate}
                    />
                </div>
            </div>
        );
    }
}

export { ConfigSelector };
