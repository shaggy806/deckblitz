/**
 * Exodus (EXO) — group D of the oldest-first set walk (B187).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  activate,
  attack,
  graveyard,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** Answer every mode question with the option whose text matches `re`. */
function answer(seat: ScriptedController, re: RegExp): void {
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    const i = (texts ?? []).findIndex((t) => re.test(t));
    if (i < 0) throw new Error(`no option matching ${re}: ${JSON.stringify(texts)}`);
    return [i];
  };
}

/** Take none of the options offered. */
function decline(seat: ScriptedController): void {
  seat.chooseModesFn = () => [];
}

describe("Dauthi Cutthroat", () => {
  it("destroys a creature with shadow", () => {
    const { game } = table();
    const cutthroat = spawn(game, "Dauthi Cutthroat");
    const victim = spawn(game, "Dauthi Cutthroat", B);
    lands(game, "Swamp", 2);
    activate(game, cutthroat, 0, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Avenging Druid", () => {
  it("puts the land found onto the battlefield and the other revealed cards into the graveyard", () => {
    const { game, a } = table();
    const druid = spawn(game, "Avenging Druid");
    const bears = toLibrary(game, "Grizzly Bears"); // on top of the Wastes
    answer(a, /^(yes|reveal)/i);
    attack(game, a, [druid]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(1);
  });
});

describe("Carnophage", () => {
  it("is tapped unless you pay 1 life", () => {
    const { game, a } = table();
    const phage = spawn(game, "Carnophage");
    answer(a, /pay 1 life/i);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(game.state.objects[phage].tapped).toBe(false);
    decline(a);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(game.state.objects[phage].tapped).toBe(true);
  });
});

describe("School of Piranha", () => {
  it("is sacrificed unless you pay {1}{U}", () => {
    const { game, a } = table();
    const school = spawn(game, "School of Piranha");
    lands(game, "Island", 2);
    decline(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, school)).toBe("graveyard");
  });
});

describe("Zealots en-Dal", () => {
  it("gains 1 life only while every nonland permanent you control is white", () => {
    const { game } = table();
    spawn(game, "Zealots en-Dal");
    lands(game, "Swamp", 1); // a land of another colour identity doesn't matter
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(21);
    spawn(game, "Sol Ring"); // colourless, so not white
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(21);
  });
});

describe("Scalding Salamander", () => {
  it("deals 1 damage to each creature without flying the defending player controls", () => {
    const { game, a } = table();
    const salamander = spawn(game, "Scalding Salamander");
    const elves = spawn(game, "Llanowar Elves", B);
    const bird = spawn(game, "Birds of Paradise", B);
    const mine = spawn(game, "Llanowar Elves");
    answer(a, /^(yes|have)/i);
    attack(game, a, [salamander]);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bird)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Reckless Ogre", () => {
  it("gets +3/+0 attacking alone, not with another attacker", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Reckless Ogre");
    attack(game, a, [ogre]);
    expect(life(game, B)).toBe(14);
    expect(pt(game, ogre).power).toBe(6);
  });
});

describe("Avenging Druid", () => {
  it("does nothing when you decline", () => {
    const { game, a } = table();
    const druid = spawn(game, "Avenging Druid");
    const bears = toLibrary(game, "Grizzly Bears");
    decline(a);
    attack(game, a, [druid]);
    expect(zone(game, bears)).toBe("library");
    expect(graveyard(game, A)).toHaveLength(0);
  });
});
