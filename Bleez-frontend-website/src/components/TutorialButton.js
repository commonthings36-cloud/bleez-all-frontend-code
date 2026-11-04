import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorial } from '../contexts/TutorialContext';
import { Button } from './ui/button';
import { HelpCircle, RotateCcw, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const TutorialButton = ({ variant = 'icon' }) => {
  const navigate = useNavigate();
  const { resetTutorial, hasSeenTutorial } = useTutorial();

  const goToTutorial = () => {
    navigate('/tutorial');
  };

  if (variant === 'full') {
    return (
      <Button
        onClick={goToTutorial}
        variant="outline"
        className="gap-2 border-primary/30 hover:bg-primary/10"
      >
        <Play className="w-4 h-4" />
        Take a Tour
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="App Tutorial"
        >
          <HelpCircle className="w-5 h-5" />
          {!hasSeenTutorial && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={goToTutorial}>
          <Play className="w-4 h-4 mr-2" />
          Watch Tutorial
        </DropdownMenuItem>
        {hasSeenTutorial && (
          <DropdownMenuItem onClick={() => { resetTutorial(); goToTutorial(); }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Tutorial
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TutorialButton;
