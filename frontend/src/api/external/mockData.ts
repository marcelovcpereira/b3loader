import { EquitiesPositionsEntity, EquitiesResponse } from './b3'

const userId = "999999999"

const getEquitiesPositionEntity = (date: string, name: string, price: number, qty: number, type: string): EquitiesPositionsEntity => {
    return {
        documentNumber: userId,
        referenceDate: date,
        productCategoryName: "stock",
        productTypeName: type,
        markingIndicator: "",
        tickerSymbol: name,
        corporationName: "",
        specificationCode: "",
        participantName: "",
        participantDocumentNumber: "",
        equitiesQuantity: qty,
        closingPrice: price,
        updateValue: 0,
        isin: "",
        distributionIdentification: 0,
        bookkeeperName: "Genial",
        availableQuantity: 0,
        unavailableQuantity: 0,
        administratorName: "",
        participantCode: "",
        accountNumber: "",
        reasons: null
    }
}

const list: EquitiesPositionsEntity[] = [
    getEquitiesPositionEntity(new Date().toString(), "BBAS3", 26.89, 394, "Company"),
    getEquitiesPositionEntity(new Date().toString(), "HSLG11", 87.76, 52, "REIT"),
    getEquitiesPositionEntity(new Date().toString(), "RZTR11", 94.26, 21, "REIT"),
    getEquitiesPositionEntity(new Date().toString(), "KNCR11", 105.99, 10, "REIT"),
    getEquitiesPositionEntity(new Date().toString(), "XPLG11", 103.80, 10, "REIT"),
    getEquitiesPositionEntity(new Date().toString(), "AZIN11", 98.25, 8, "Fund"),
    getEquitiesPositionEntity(new Date().toString(), "KLBN4", 4.27, 116, "Company"),
    getEquitiesPositionEntity(new Date().toString(), "PETR4", 37.64, 11, "Company"),
    getEquitiesPositionEntity(new Date().toString(), "SAPR11", 26.67, 13, "Company"),
    getEquitiesPositionEntity(new Date().toString(), "TAEE11", 33.86, 11, "Company"),
    getEquitiesPositionEntity(new Date().toString(), "SANB11", 27.98, 8, "Company"),
  ];

export const response: EquitiesResponse = {
    data: { equitiesPositions: list },
    Links: {
        self: "string",
        first: "string",
        prev: "string",
        next: "string",
        last: "string",
    }
}

export enum MockStockType {
    COMPANY = 'company',
    REIT = 'reit',
    FUND = 'fund'
}

export enum MockStockSubtype {
    REIT_PAPER = 'reit_paper',
    REIT_BRICK = 'reit_brick',
    REIT_HYBRID = 'reit_hybrid',
    COMPANY_BANK = 'company_bank',
    COMPANY_ENERGY = 'company_energy',
    COMPANY_INSURANCE = 'company_insurance',
    COMPANY_INFRA = 'company_infra',
    COMPANY_COMMODITIES = 'company_commodities',
    FUND_INFRA = 'fund_infra',
    FUND_OTHER = 'fund_other',
}

export type MockStockDetails = {
    name: string;
    type: MockStockType;
    subtype: MockStockSubtype;
}
export const getMockStockDetails = (stockName: string): MockStockDetails | undefined  => {
    return allDetails.get(stockName)
}

const allDetails: Map<string,MockStockDetails> = new Map<string, MockStockDetails>([
    ["BBAS3", {name: "BBAS3", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_BANK}],
    ["HSLG11", {name: "HSLG11", type: MockStockType.REIT, subtype: MockStockSubtype.REIT_HYBRID}],
    ["RZTR11", {name: "RZTR11", type: MockStockType.REIT, subtype: MockStockSubtype.REIT_HYBRID}],
    ["KNCR11", {name: "KNCR11", type: MockStockType.REIT, subtype: MockStockSubtype.REIT_PAPER}],
    ["XPLG11", {name: "XPLG11", type: MockStockType.REIT, subtype: MockStockSubtype.REIT_BRICK}],
    ["AZIN11", {name: "AZIN11", type: MockStockType.FUND, subtype: MockStockSubtype.FUND_INFRA}],
    ["KLBN4", {name: "KLBN4", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_COMMODITIES}],
    ["PETR4", {name: "PETR4", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_COMMODITIES}],
    ["TAEE11", {name: "TAEE11", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_ENERGY}],
    ["SAPR11", {name: "SAPR11", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_INFRA}],
    ["SANB11", {name: "SANB11", type: MockStockType.COMPANY, subtype: MockStockSubtype.COMPANY_BANK}],
])
