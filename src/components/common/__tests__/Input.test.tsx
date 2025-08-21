import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Input from '../Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    const {getByText} = render(
      <Input label="Test Input" placeholder="Enter text" />
    );
    
    expect(getByText('Test Input')).toBeTruthy();
  });

  it('shows error message when error prop is provided', () => {
    const {getByText} = render(
      <Input label="Input" error="This field is required" />
    );
    
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('shows required asterisk when required prop is true', () => {
    const {getByText} = render(
      <Input label="Required Field" required={true} />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const {getByDisplayValue} = render(
      <Input 
        placeholder="Type here"
        onChangeText={mockOnChangeText}
        value=""
      />
    );
    
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test text');
    expect(mockOnChangeText).toHaveBeenCalledWith('test text');
  });

  it('applies accessibility labels correctly', () => {
    const {getByLabelText} = render(
      <Input label="Email Address" placeholder="Enter email" />
    );
    
    expect(getByLabelText('Email Address')).toBeTruthy();
  });
});