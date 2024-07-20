export interface EquitiesResponse {
    data: Data;
    Links: Links;
  }
  export interface Data {
    equitiesPositions?: (EquitiesPositionsEntity)[] | null;
  }
  export interface EquitiesPositionsEntity {
    documentNumber: string;
    referenceDate: string;
    productCategoryName: string;
    productTypeName: string;
    markingIndicator: string;
    tickerSymbol: string;
    corporationName: string;
    specificationCode: string;
    participantName: string;
    participantDocumentNumber: string;
    equitiesQuantity: number;
    closingPrice: number;
    updateValue: number;
    isin: string;
    distributionIdentification: number;
    bookkeeperName: string;
    availableQuantity: number;
    unavailableQuantity: number;
    administratorName: string;
    participantCode: string;
    accountNumber: string;
    reasons?: (ReasonsEntity)[] | null;
  }
  export interface ReasonsEntity {
    reasonName: string;
    collateralQuantity: number;
    counterpartName: string;
  }
  export interface Links {
    self: string;
    first: string;
    prev: string;
    next: string;
    last: string;
  }
  