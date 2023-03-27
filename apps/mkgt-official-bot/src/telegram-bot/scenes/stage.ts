import { Scenes } from "telegraf";
import { navigationScene } from "./navigationScene";
import { academicalSpravkaWizardScene } from "./spravkiScenes/akademicalSpravkaWizardScene";
import { attestatCopyWizardScene } from "./spravkiScenes/attestatCopyWizardScene";
import { educationSpravkaWizardScene } from "./spravkiScenes/educationPeriodSpravkaScene";
import { voenkomatSpravkaWizardScene } from "./spravkiScenes/voenkomatSpravkaScene";

export const botStage = new Scenes.Stage<Scenes.SceneContext>(
    [
        navigationScene,



        voenkomatSpravkaWizardScene,
        educationSpravkaWizardScene,
        attestatCopyWizardScene,
        academicalSpravkaWizardScene,
    ]
)