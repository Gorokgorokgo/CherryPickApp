import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <Button title="Press Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    const {getByTestId} = render(
      <Button title="Loading" onPress={() => {}} loading={true} testID="loading-button" />
    );
    
    expect(getByTestId('loading-button')).toBeTruthy();
  });

  it('applies variant styles correctly', () => {
    const {getByTestId} = render(
      <Button 
        title="Secondary" 
        onPress={() => {}} 
        variant="secondary"
        testID="secondary-button" 
      />
    );
    
    expect(getByTestId('secondary-button')).toBeTruthy();
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