import React, { useRef, useState } from 'react';
import Receipt from './Receipt';
import OverallBalanceCard from './OverallBalanceCard';

function ReceiptCarousel({ 
  receipts, 
  currentIndex, 
  onUpdateReceipt, 
  onDeleteReceipt, 
  onNavigate, 
  friends,
  overallBalanceData,
  isReadOnly = false,
  onShareStack,
  stackName
}) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [isSwiping, setIsSwiping] = useState(false);
  // Create combined array of receipts + overall balance card
  const allCards = [...receipts];
  if (overallBalanceData && overallBalanceData.completedReceipts.length > 0) {
    allCards.push({
      id: 'overall-balance',
      isOverallBalance: true,
      ...overallBalanceData
    });
  }

  const getCardClass = (index) => {
    if (index === currentIndex) return 'active';
    if (index === currentIndex - 1) return 'prev';
    if (index === currentIndex + 1) return 'next';
    return 'hidden';
  };

  const handlePrevious = () => {
    // Circular navigation: go to last card if at first
    const newIndex = currentIndex === 0 ? allCards.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    // Circular navigation: go to first card if at last
    const newIndex = currentIndex === allCards.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  const canNavigatePrev = true; // Always can navigate with circular
  const canNavigateNext = true; // Always can navigate with circular

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next
        handleNext();
      } else {
        // Swiped right - go to previous
        handlePrevious();
      }
    }
    
    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div 
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows */}
      <button 
        className="nav-arrow prev"
        onClick={handlePrevious}
        disabled={!canNavigatePrev}
        title="Previous"
      >
        ‹
      </button>

      {/* Cards (Receipts + Overall Balance) */}
      {allCards.map((card, index) => (
        <div
          key={card.id}
          className={`receipt-card ${getCardClass(index)}`}
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: '-200px'
          }}
        >
          {card.isOverallBalance ? (
            <OverallBalanceCard
              balances={card.balances}
              friends={friends}
              completedReceipts={card.completedReceipts}
              onShareStack={onShareStack}
              isReadOnly={isReadOnly}
              stackName={stackName}
            />
          ) : (
            <Receipt
              receipt={card}
              friends={friends}
              onUpdate={(updatedReceipt) => onUpdateReceipt(index, updatedReceipt)}
              onDelete={() => onDeleteReceipt(index)}
              isActive={index === currentIndex}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      ))}

      <button 
        className="nav-arrow next"
        onClick={handleNext}
        disabled={!canNavigateNext}
        title="Next"
      >
        ›
      </button>
    </div>
  );
}

export default ReceiptCarousel;
