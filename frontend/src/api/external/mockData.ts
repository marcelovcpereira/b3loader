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