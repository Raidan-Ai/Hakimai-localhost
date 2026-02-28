import React from 'react';
import Joyride, { Step } from 'react-joyride';

interface TourProps {
  run: boolean;
  callback: (data: any) => void;
}

const Tour: React.FC<TourProps> = ({ run, callback }) => {
  const steps: Step[] = [
    {
      target: '.sidebar',
      content: 'This is the main navigation sidebar. You can switch between different sections of the application here.',
      placement: 'right',
    },
    {
      target: '.chat-input',
      content: 'This is the chat input area. You can type your questions or describe symptoms here.',
      placement: 'top',
    },
    {
      target: '.drive-button',
      content: 'Click here to select a file from your connected Google Drive for analysis.',
      placement: 'top',
    },
    {
      target: '.upload-button',
      content: 'Use this button to upload a local file from your computer.',
      placement: 'top',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={callback}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          primaryColor: '#007bff',
          textColor: '#333',
          width: 900,
          zIndex: 1000,
        }
      }}
    />
  );
};

export default Tour;
