import { TypeJsonEditorFormField } from '../../../form-field/src';
import {
  TypeJsonEditorFormFieldActionAPI,
  TypeJsonEditorFormFieldValue,
} from '../../../form-field/src/types';
import { TypeJsonRunner } from '../../../runner/src';
import loader from '@monaco-editor/loader';
import { tx } from '@twind/core';
import {
  TypeJsonEditor,
  type TypeJsonEditorFileAPI,
  type TypeJsonEditorValidationAPI,
} from '@typejson-editor/editor';
import { useMount } from 'ahooks';
import { Button, Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import type * as Monaco from 'monaco-editor';
import { useMemo, useRef, useState } from 'react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
  },
});

export default function FormItem() {
  const fileRef = useRef<TypeJsonEditorFileAPI>(null);
  const validationRef = useRef<TypeJsonEditorValidationAPI>(null);
  const runnerInstanceRef = useRef<TypeJsonRunner | null>(null);
  const actionRef = useRef<TypeJsonEditorFormFieldActionAPI>(null);
  const [formInstance] = useForm();

  const [monaco, setMonaco] = useState<typeof Monaco | null>(null);
  useMount(() => {
    loader.init().then(monaco => {
      setMonaco(monaco);
    });
    runnerInstanceRef.current = new TypeJsonRunner();
  });
  if (!monaco) return 'Monaco loading...';

  return (
    <div
      // className={tx`size-[500px]`}
      style={{ height: 500, width: 500 }}
    >
      <Form
        form={formInstance}
        onValuesChange={values => {
          console.log('values', values);
        }}
        initialValues={{}}
      >
        <Form.Item label="我是表单label" name="json">
          <TypeJsonEditorFormField
            editorProps={{
              monaco,
              plugins: { typeAcquisition: { enabled: true }, vim: { enabled: false } },
              styles: {
                minHeight: 300,
                boxShadow: '0px 0px 0px 1px #000000',
                borderRadius: 4,
              },
            }}
            actionRef={actionRef}
          />
        </Form.Item>
        <Button
          onClick={async () => {
            const isValid = await actionRef.current?.validate();
            console.log('isValid', isValid);
          }}
        >
          提交啊
        </Button>
      </Form>
    </div>
  );
}
