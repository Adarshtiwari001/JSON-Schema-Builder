import React from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { Input, Select, Button, Card, Space } from 'antd';

const fieldTypes = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Nested', value: 'nested' },
];

// ✅ Utility to transform fields into clean JSON
const transformSchema = (fields) => {
  const result = {};

  fields.forEach((field) => {
    const key = field.key?.trim();
    const type = field.type;

    if (!key) return;

    if (type === 'nested') {
      result[key] = transformSchema(field.fields || []);
    } else {
      result[key] = type;
    }
  });

  return result;
};

function NestedFields({ namePrefix }) {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: namePrefix,
  });

  return (
    <div style={{ marginLeft: 20 }}>
      {fields.map((item, idx) => {
        const path = `${namePrefix}[${idx}]`;

        return (
          <Card size="small" key={item.id} style={{ marginBottom: 10 }}>
            <Space>
              <Controller
                control={control}
                name={`${path}.key`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Field Name"
                    style={{ width: 120 }}
                    onChange={(e) => {
                      field.onChange(e);
                      watch(`${path}.key`); // Trigger re-render
                    }}
                  />
                )}
              />

              <Controller
                control={control}
                name={`${path}.type`}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={fieldTypes}
                    placeholder="Type"
                    style={{ width: 110 }}
                    onChange={(value) => {
                      field.onChange(value);
                      watch(`${path}.type`); // Trigger re-render
                    }}
                  />
                )}
              />

              <Button type="text" danger onClick={() => remove(idx)}>
                Delete
              </Button>
            </Space>

            {watch(`${path}.type`) === 'nested' && (
              <NestedFields namePrefix={`${path}.fields`} />
            )}
          </Card>
        );
      })}

      <Button
        type="dashed"
        onClick={() => append({ key: '', type: 'string', fields: [] })}
        style={{ width: '60%', marginTop: 8 }}
      >
        + Add Field
      </Button>
    </div>
  );
}

function JSONPreview({ data }) {
  const transformed = transformSchema(data);

  return (
    <pre
      style={{
        background: '#f6f8fa',
        padding: 16,
        borderRadius: 4,
        minHeight: 200,
        marginTop: 16,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(transformed, null, 2)}
    </pre>
  );
}

const SchemaBuilder = () => {
  const methods = useForm({
    defaultValues: { fields: [] },
  });

  const onSubmit = (data) => {
    const schema = transformSchema(data.fields);
    console.log('Submitted schema:', schema);
    alert('Schema submitted! Check console for details.');
  };

  const watchFields = methods.watch('fields', []);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        style={{ display: 'flex', gap: 40 }}
      >
        <div style={{ minWidth: 430, maxWidth: 450 }}>
          <h2>JSON Schema Builder</h2>
          <NestedFields namePrefix="fields" />
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '60%', marginTop: 18 }}
          >
            Submit
          </Button>
        </div>

        <div style={{ flexGrow: 1 }}>
          <h3>JSON Preview</h3>
          <JSONPreview data={watchFields} />
        </div>
      </form>
    </FormProvider>
  );
};

export default SchemaBuilder;
