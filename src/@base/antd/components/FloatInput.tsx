import { Input, InputProps } from 'antd';

export interface IProps extends InputProps {
  required?: boolean;
}

const FloatInput: React.FC<IProps> = ({
  placeholder,
  defaultValue,
  value,
  onFocus,
  onBlur,
  onChange,
  required: _required,
  size,
  style,
  className,
  ...rest
}) => {
  return (
    <Input
      {...rest}
      className={className}
      style={style}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      size={size}
    />
  );
};

export default FloatInput;
