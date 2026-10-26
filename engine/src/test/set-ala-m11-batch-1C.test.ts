/**
 * Shards of Alara and Magic 2011, group C. One test per card on its riskiest
 * clause.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  lands,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Caldera Hellion", () => {
  it("devours, then deals 3 damage to each creature — itself included", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    a.choosePermanentsFn = () => [bears];
    lands(game, "Mountain", 5);
    const hellion = toHand(game, "Caldera Hellion");
    cast(game, hellion);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, hellion)).toBe("battlefield");
    expect(counters(game, hellion)).toBe(1);
    expect(game.state.objects[hellion].damageMarked).toBe(3);
  });

  it("devouring nothing, it kills itself", () => {
    const { game, a } = table();
    a.choosePermanentsFn = () => [];
    lands(game, "Mountain", 5);
    const hellion = toHand(game, "Caldera Hellion");
    cast(game, hellion);
    expect(zone(game, hellion)).toBe("graveyard");
  });
});

describe("Demon's Herald", () => {
  it("sacrifices a blue, a black (itself) and a red creature to fetch Prince of Thralls", () => {
    const { game, a } = table();
    const herald = spawn(game, "Demon's Herald");
    const merfolk = spawn(game, "Coral Merfolk");
    const goblin = spawn(game, "Raging Goblin");
    lands(game, "Swamp", 3);
    const prince = toLibrary(game, "Prince of Thralls");
    pickFromZone(a, prince);
    activate(game, herald, 0);
    settle(game);
    expect(zone(game, herald)).toBe("graveyard");
    expect(zone(game, merfolk)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, prince)).toBe("battlefield");
  });

  it("can't be activated without a red creature", () => {
    const { game } = table();
    const herald = spawn(game, "Demon's Herald");
    spawn(game, "Coral Merfolk");
    spawn(game, "Walking Corpse");
    lands(game, "Swamp", 3);
    expect(() => activate(game, herald, 0)).toThrow();
  });
});

describe("Bloodpyre Elemental", () => {
  it("sacrifices itself to deal 4 damage, only at sorcery speed", () => {
    const { game } = table();
    const pyre = spawn(game, "Bloodpyre Elemental");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, pyre, 0, { targets: [ref(giant)] });
    expect(zone(game, pyre)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");

    const other = spawn(game, "Bloodpyre Elemental");
    toStep(game, "upkeep", B);
    expect(() => activate(game, other, 0, { targets: [ref(giant)] })).toThrow();
  });
});

describe("Mass Polymorph", () => {
  it("exiles your creatures (each token counting) and puts that many creature cards onto the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Saproling Token", count: 2 }, []);
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Island", 6);
    const fourth = toLibrary(game, "Raging Goblin");
    const third = toLibrary(game, "Goblin Piker");
    toLibrary(game, "Wastes");
    const second = toLibrary(game, "Walking Corpse");
    const first = toLibrary(game, "Gray Ogre");
    const spell = toHand(game, "Mass Polymorph");
    cast(game, spell);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(zone(game, third)).toBe("battlefield");
    expect(zone(game, fourth)).toBe("library");
  });
});

describe("Roc Egg", () => {
  it("dies into a 3/3 white flying Bird", () => {
    const { game } = table();
    const egg = spawn(game, "Roc Egg");
    destroy(game, egg);
    expect(graveyard(game, A)).toContain(egg);
    expect(tokensNamed(game, "3/3 White Bird Token", A)).toBe(1);
    const [bird] = named(game, "3/3 White Bird Token", A);
    expect(pt(game, bird)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Resounding Roar", () => {
  it("cycled, it gives target creature +6/+6", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 8);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const card = toHand(game, "Resounding Roar");
    pickTargets(a, bears);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Incite", () => {
  it("makes the creature red only, until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Incite"), { targets: [ref(bears)] });
    expect([...game.characteristics(bears).colors]).toEqual(["R"]);  });
});
