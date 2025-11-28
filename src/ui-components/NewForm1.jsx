/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";

// Safe override props handler that returns individual props to prevent spreading
const getSafeOverrideProps = (overrides, elementHierarchy) => {
  const props = getOverrideProps(overrides, elementHierarchy);
  if (!props) return {};
  
  // Return only safe, explicitly defined props
  return {
    className: props.className,
    id: props.id,
    style: props.style,
    onClick: props.onClick,
    onSubmit: props.onSubmit,
    onChange: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    disabled: props.disabled,
    isDisabled: props.isDisabled,
    children: props.children,
    gap: props.gap,
    justifyContent: props.justifyContent,
    alignItems: props.alignItems,
    padding: props.padding,
    margin: props.margin,
    width: props.width,
    height: props.height,
    color: props.color,
    backgroundColor: props.backgroundColor,
    type: props.type,
    variation: props.variation,
    size: props.size,
    rowGap: props.rowGap,
    columnGap: props.columnGap,
    as: props.as
  };
};
export default function NewForm1(props) {
  const { 
    onSubmit, 
    onValidate, 
    onChange, 
    overrides,
    // Extract known safe HTML attributes that can be passed to Grid
    className,
    id,
    'data-testid': dataTestId,
    style
    // Removed ...rest to eliminate props spreading security risk
  } = props;
  const initialValues = {};
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setErrors({});
  };
  const validations = {};
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        const modelFields = {};
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        await onSubmit(modelFields);
      }}
      className={className || getSafeOverrideProps(overrides, "NewForm1").className}
      id={id || getSafeOverrideProps(overrides, "NewForm1").id}
      data-testid={dataTestId}
      style={style || getSafeOverrideProps(overrides, "NewForm1").style}
      rowGap={getSafeOverrideProps(overrides, "NewForm1").rowGap || "15px"}
      columnGap={getSafeOverrideProps(overrides, "NewForm1").columnGap || "15px"}
      padding={getSafeOverrideProps(overrides, "NewForm1").padding || "20px"}
    >
      <Flex
        justifyContent={getSafeOverrideProps(overrides, "CTAFlex").justifyContent || "space-between"}
        className={getSafeOverrideProps(overrides, "CTAFlex").className}
        id={getSafeOverrideProps(overrides, "CTAFlex").id}
        style={getSafeOverrideProps(overrides, "CTAFlex").style}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          className={getSafeOverrideProps(overrides, "ClearButton").className}
          id={getSafeOverrideProps(overrides, "ClearButton").id}
          style={getSafeOverrideProps(overrides, "ClearButton").style}
          disabled={getSafeOverrideProps(overrides, "ClearButton").disabled}
          variation={getSafeOverrideProps(overrides, "ClearButton").variation}
        ></Button>
        <Flex
          gap={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").gap || "15px"}
          className={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").className}
          id={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").id}
          style={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").style}
          justifyContent={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").justifyContent}
          alignItems={getSafeOverrideProps(overrides, "RightAlignCTASubFlex").alignItems}
        >
          <Button
            children="Submit"
            type="submit"
            variation={getSafeOverrideProps(overrides, "SubmitButton").variation || "primary"}
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            className={getSafeOverrideProps(overrides, "SubmitButton").className}
            id={getSafeOverrideProps(overrides, "SubmitButton").id}
            style={getSafeOverrideProps(overrides, "SubmitButton").style}
            disabled={getSafeOverrideProps(overrides, "SubmitButton").disabled}
            onClick={getSafeOverrideProps(overrides, "SubmitButton").onClick}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
