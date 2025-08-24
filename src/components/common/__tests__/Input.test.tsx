import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Input from '../Input';

describe('Input Component', () => {
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
});