import React, { Component } from 'react';
import styles from "./main.module.css";
import { CommandBar } from "../cmd-bar/CommandBar";
import { ConfigSelector, IFormatConfigData } from '../config-selector/ConfigSelector';
import { FormatIntro } from '../intro/FormatIntro';
import { LintIntro } from '../intro/LintIntro';
import { ManualIntro } from '../intro/ManualIntro';
import { connect } from 'react-redux';

interface IMainState
{
    config: IFormatConfigData | null;
    customTemplateBuffer: ArrayBuffer | null;
}

class Main extends Component<any, IMainState>
{
    constructor(props: any)
    {
        super(props);
        this.state = {
            config: null,
            customTemplateBuffer: null
        };
    }

    OnConfigChange = (config: IFormatConfigData | null, templateBuffer: ArrayBuffer | null) =>
    {
        this.setState({
            config: config,
            customTemplateBuffer: templateBuffer
        });
    }

    DisplayIntro()
    {
        switch ((this.props as any).link_key)
        {
            case "format":
                return <FormatIntro />;
            case "lint":
                return <LintIntro />;
            case "manual":
                return <ManualIntro />;
            default:
                return <FormatIntro />;
        }
    }

    DisplayCmdBar()
    {
        switch ((this.props as any).link_key)
        {
            case "manual":
                return null;
            default:
                return <CommandBar config={this.state.config} customTemplateBuffer={this.state.customTemplateBuffer} />;
        }
    }

    DisplayConfigSelector()
    {
        switch ((this.props as any).link_key)
        {
            case "format":
                return <ConfigSelector onConfigChange={this.OnConfigChange} />;
            default:
                return null;
        }
    }

    render()
    {
        return (
            <div className={styles.main}>
                {this.DisplayConfigSelector()}
                {this.DisplayCmdBar()}
                {this.DisplayIntro()}
            </div>
        );
    }
}

const MapStateToProps = (state: any) =>
{
    return { link_key: state.link_key }
}

const __Main = connect(MapStateToProps)(Main);
export { __Main as Main };
