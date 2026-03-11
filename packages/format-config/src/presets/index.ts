import { ThesisFormatConfig } from "../interfaces";
import * as buaaUndergraduate from "./buaa-undergraduate.json";

const presets: { [index: string]: ThesisFormatConfig } =
{
    "buaa-undergraduate": buaaUndergraduate as any as ThesisFormatConfig
};

export function getPreset(id: string): ThesisFormatConfig
{
    if (id in presets)
    {
        return presets[id];
    }
    return null;
}

export function listPresets(): Array<{ id: string; name: string; university: string }>
{
    return Object.keys(presets).map(id =>
    {
        const config = presets[id];
        return {
            id: config.meta.id,
            name: config.meta.name,
            university: config.meta.university
        };
    });
}

export function getDefaultPreset(): ThesisFormatConfig
{
    return presets["buaa-undergraduate"];
}
