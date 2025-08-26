import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <Button title="Press Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <Button title="Disabled" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});