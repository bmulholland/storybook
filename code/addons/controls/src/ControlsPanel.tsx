import { dequal as deepEqual } from 'dequal';
import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useArgs,
  useGlobals,
  useArgTypes,
  useParameter,
  useStorybookState,
} from '@storybook/manager-api';
import { PureArgsTable as ArgsTable, type PresetColor, type SortType } from '@storybook/blocks';

import type { ArgTypes } from '@storybook/types';
import { PARAM_KEY } from './constants';

// Remove undefined values (top-level only)
const clean = (obj: { [key: string]: any }) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => (value !== undefined ? Object.assign(acc, { [key]: value }) : acc),
    {} as typeof obj
  );

interface ControlsParameters {
  sort?: SortType;
  expanded?: boolean;
  presetColors?: PresetColor[];
}

export const ControlsPanel: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [args, updateArgs, resetArgs, initialArgs] = useArgs();
  const [globals] = useGlobals();
  const rows = useArgTypes();
  const { expanded, sort, presetColors } = useParameter<ControlsParameters>(PARAM_KEY, {});
  const { path, previewInitialized } = useStorybookState();

  // If the story is prepared, then show the args table
  // and reset the loading states
  useEffect(() => {
    if (previewInitialized) setIsLoading(false);
  }, [previewInitialized]);

  const hasControls = Object.values(rows).some((arg) => arg?.control);

  const withPresetColors = Object.entries(rows).reduce((acc, [key, arg]) => {
    if (arg?.control?.type !== 'color' || arg?.control?.presetColors) acc[key] = arg;
    else acc[key] = { ...arg, control: { ...arg.control, presetColors } };
    return acc;
  }, {} as ArgTypes);

  const hasUpdatedArgs = useMemo(
    () => !!args && !!initialArgs && !deepEqual(clean(args), clean(initialArgs)),
    [args, initialArgs]
  );

  return (
    <ArgsTable
      key={path} // resets state when switching stories
      compact={!expanded && hasControls}
      rows={withPresetColors}
      args={args}
      globals={globals}
      hasUpdatedArgs={hasUpdatedArgs}
      updateArgs={updateArgs}
      resetArgs={resetArgs}
      inAddonPanel
      sort={sort}
      isLoading={isLoading}
    />
  );
};
