﻿import { Inbound } from "../Messages";
import { sys, Feature } from"../../../Equipment";
import { state } from "../../../State";
export class FeatureMessage {
    public static process(msg: Inbound): void {
        switch (msg.extractPayloadByte(1)) {
            case 0: // Feature Type
                FeatureMessage.processIsActive(msg);
                break;
            case 1: // Freeze
                FeatureMessage.processFreezeProtect(msg);
                break;
            case 2: // Show in features
                FeatureMessage.processShowInFeatures(msg);
                break;
            case 3:
                FeatureMessage.processEggTimerHours(msg);
                break;
            case 4:
                FeatureMessage.processEggTimerMinutes(msg);
                break;
            case 5:
                FeatureMessage.processFeatureType(msg);
                break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
                FeatureMessage.processFeatureNames(msg);
                break;
            case 22: // Not sure what this is.
                break;
        }
    }
    private static processIsActive(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            var feature: Feature = sys.features.getItemById(featureId, msg.extractPayloadByte(i + 1) !== 255);
            if (feature.isActive && msg.extractPayloadByte(i + 1) === 255) sys.features.removeItemById(featureId);
            feature.isActive = msg.extractPayloadByte(i + 1) !== 255;
            if (!feature.isActive) state.features.removeItemById(featureId);
            else state.features.getItemById(featureId, true);
        }
    }
    private static processFeatureType(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            let feature: Feature = sys.features.getItemById(featureId);
            feature.type = msg.extractPayloadByte(i + 1);
            let sFeature = state.features.getItemById(featureId);
            sFeature.type = feature.type;
        }
    }
    private static processFreezeProtect(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            var feature: Feature = sys.features.getItemById(featureId);
            feature.freeze = msg.extractPayloadByte(i + 1) > 0;
        }
    }
    private static processFeatureNames(msg: Inbound) {
        var featureId = ((msg.extractPayloadByte(1) - 6) * 2) + sys.board.equipmentIds.features.start;
        if (sys.board.equipmentIds.features.isInRange(featureId)) {
            let feature: Feature = sys.features.getItemById(featureId++);
            feature.name = msg.extractPayloadString(2, 16);
            if (feature.isActive) state.features.getItemById(feature.id).name = feature.name;
        }
        if (sys.board.equipmentIds.features.isInRange(featureId)) {
            let feature: Feature = sys.features.getItemById(featureId++);
            feature.name = msg.extractPayloadString(18, 16);
            if (feature.isActive) state.features.getItemById(feature.id).name = feature.name;
        }
        state.emitEquipmentChanges();
    }
    private static processEggTimerHours(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            let feature: Feature = sys.features.getItemById(featureId);
            feature.eggTimer = (msg.extractPayloadByte(i + 1) * 60) + ((feature.eggTimer || 0) % 60);
        }
    }
    private static processEggTimerMinutes(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            var feature: Feature = sys.features.getItemById(featureId);
            feature.eggTimer = (Math.floor(feature.eggTimer / 60) * 60) + msg.extractPayloadByte(i + 1);
        }
    }
    private static processShowInFeatures(msg: Inbound) {
        for (let i = 1; i < msg.payload.length - 1 && i <= sys.equipment.maxFeatures; i++) {
            let featureId = i + sys.board.equipmentIds.features.start - 1;
            var feature: Feature = sys.features.getItemById(featureId);
            feature.showInFeatures = msg.extractPayloadByte(i + 1) > 0;
            if (feature.isActive) state.features.getItemById(featureId, feature.isActive).showInFeatures = feature.showInFeatures;
        }
        state.emitEquipmentChanges();
    }

}