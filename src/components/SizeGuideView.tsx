import React, { useState } from 'react';
import { FitProfile } from '../data/storeData';
import { computeRecommendedSize, recommendedBottomSize } from '../lib/sizing';
import { POINT_DATA, SIZE_ROWS } from './sizeguide/data';
import { BreadcrumbBar } from './sizeguide/BreadcrumbBar';
import { TitleTabs } from './sizeguide/TitleTabs';
import { SilhouettePanel } from './sizeguide/SilhouettePanel';
import { FitFinderColumn } from './sizeguide/FitFinderColumn';
import { SpecTable } from './sizeguide/SpecTable';
import { ModelComparison } from './sizeguide/ModelComparison';
import { MeasuringProtocols } from './sizeguide/MeasuringProtocols';
import { StickyBar } from './sizeguide/StickyBar';

interface SizeGuideViewProps {
  fitProfile: FitProfile;
  onUpdateFitProfile: (updated: FitProfile) => void;
  onApplyAndReturn: (selectedSize: string) => void;
  onBack: () => void;
}

export const SizeGuideView: React.FC<SizeGuideViewProps> = ({
  fitProfile,
  onUpdateFitProfile,
  onApplyAndReturn,
  onBack,
}) => {
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'outerwear'>('tops');
  const [activePoint, setActivePoint] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [heightInput, setHeightInput] = useState<number>(175);
  const [weightInput, setWeightInput] = useState<number>(68);
  const [preference, setPreference] = useState<'slim' | 'regular' | 'oversized'>(
    fitProfile.preference || 'oversized'
  );
  const [selectedSize, setSelectedSize] = useState<string>(fitProfile.calculatedSize || 'L');

  const handleCalculate = (
    h = heightInput,
    w = weightInput,
    pref = preference
  ) => {
    const calc = computeRecommendedSize(h, w, pref);
    setSelectedSize(calc);
    onUpdateFitProfile({
      height: h,
      weight: w,
      preference: pref,
      recommendedTop: `Size ${calc}`,
      recommendedBottom: recommendedBottomSize(w),
      calculatedSize: calc,
    });
  };

  const schematicTitle =
    category === 'tops'
      ? 'ATASAN: SILUET BOXY OVERSIZED TEE'
      : category === 'bottoms'
      ? 'BAWAHAN: WIDE STRAIGHT PLEATED TROUSER'
      : 'OUTERWEAR: RELAXED STRUCTURED BLAZER';

  const fitDescLabel =
    preference === 'oversized'
      ? 'Boxy Oversized Fit'
      : preference === 'slim'
      ? 'Tapered Slim Fit'
      : 'Relaxed Regular Fit';

  const barFitDesc =
    preference === 'oversized'
      ? 'BOXY OVERSIZED'
      : preference === 'slim'
      ? 'SLIM CUT'
      : 'REGULAR FIT';

  const sizeRows = SIZE_ROWS;
  const currentPointInfo = POINT_DATA[activePoint];

  return (
    <div className="flex flex-col w-full">
      {/* Top Technical Breadcrumb & Meta Bar */}
      <BreadcrumbBar />

      {/* Title & Category Tabs Section */}
      <TitleTabs category={category} setCategory={setCategory} />

      {/* Main Blueprint Interactive Workspace */}
      <section className="w-full px-margin md:px-margin-desktop py-space-xl">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Interactive Silhouette & Measuring Guide Panel (Left 7 Cols) */}
          <SilhouettePanel activePoint={activePoint} setActivePoint={setActivePoint} schematicTitle={schematicTitle} currentPointInfo={currentPointInfo} />

          {/* Smart Fit Finder / Precision Calculator Panel (Right 5 Cols) */}
          <FitFinderColumn onApplyAndReturn={onApplyAndReturn} heightInput={heightInput} setHeightInput={setHeightInput} weightInput={weightInput} setWeightInput={setWeightInput} preference={preference} setPreference={setPreference} selectedSize={selectedSize} handleCalculate={handleCalculate} fitDescLabel={fitDescLabel} />
        </div>
      </section>

      {/* Section 3: Precision Size Specification Table */}
      <SpecTable selectedSize={selectedSize} setSelectedSize={setSelectedSize} sizeRows={sizeRows} />

      {/* Section 4: Real Model Specs / Visual Fitting Comparison */}
      <ModelComparison setSelectedSize={setSelectedSize} />

      {/* Section 5: Step-by-Step Measuring Protocols & FAQ */}
      <MeasuringProtocols />

      {/* Sticky Conversion Bottom Bar */}
      <StickyBar onApplyAndReturn={onApplyAndReturn} onBack={onBack} selectedSize={selectedSize} barFitDesc={barFitDesc} />
    </div>
  );
};
