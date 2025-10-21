import React from 'react';
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

  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < allCards.length - 1;

  const handlePrevious = () => {
    if (canNavigatePrev) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canNavigateNext) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div className="carousel-container">
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
