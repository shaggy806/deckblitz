/**
 * Darksteel (DST; B214) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Goblin Archaeologist", () => {
  it("either destroys the artifact and untaps, or is sacrificed and the artifact stays", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      const goblin = spawn(game, "Goblin Archaeologist");
      lands(game, "Mountain", 1);
      const stone = spawn(game, "Mind Stone", B);
      activate(game, goblin, 0, { targets: [ref(stone)] });
      if (zone(game, goblin) === "battlefield") {
        expect(zone(game, stone)).toBe("graveyard");
        expect(game.state.objects[goblin].tapped).toBe(false);
      } else {
        expect(zone(game, goblin)).toBe("graveyard");
        expect(zone(game, stone)).toBe("battlefield");
      }
    }
  });
});

describe("Greater Harvester", () => {
  it("makes the damaged player sacrifice two permanents of their choice", () => {
    const { game, a, b } = table();
    const harvester = spawn(game, "Greater Harvester");
    const [m1, m2, m3] = [spawn(game, "Memnite", B), spawn(game, "Memnite", B), spawn(game, "Memnite", B)];
    const seen = { offered: [] as readonly string[] };
    b.chooseSacrificesFn = (_view, eligible) => {
      seen.offered = eligible;
      return [m1, m3];
    };
    attack(game, a, [harvester]);
    expect(life(game, B)).toBe(15);
    expect(seen.offered.length).toBeGreaterThanOrEqual(3);
    expect(zone(game, m1)).toBe("graveyard");
    expect(zone(game, m3)).toBe("graveyard");
    expect(zone(game, m2)).toBe("battlefield");
  });
});

describe("Arcane Spyglass", () => {
  it("sacrifices a land to draw and add a charge counter; three counters draw again", () => {
    const { game } = table();
    const glass = spawn(game, "Arcane Spyglass");
    lands(game, "Wastes", 2);
    const fodder = spawn(game, "Forest");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: glass, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, glass, "charge")).toBe(1);
    game.state.objects[glass].counters.charge = 3;
    activate(game, glass, 1);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, glass, "charge")).toBe(0);
  });
});

describe("Shriveling Rot", () => {
  it("entwined: a damaged creature is destroyed and its controller loses life equal to its toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    lands(game, "Mountain", 1);
    const entity = spawn(game, "Ageless Entity", B);
    cast(game, toHand(game, "Shriveling Rot"), { modes: [0, 1], kicked: true });
    cast(game, toHand(game, "Shock"), { targets: [ref(entity)] });
    expect(zone(game, entity)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("Chimeric Egg", () => {
  it("gains a charge counter only for an opponent's nonartifact spell, and becomes a 6/6 trampler", () => {
    const { game } = table();
    const egg = spawn(game, "Chimeric Egg");
    lands(game, "Mountain", 1, B);
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] });
    expect(counters(game, egg, "charge")).toBe(1);
    nextTurn(game);
    game.state.objects[egg].counters.charge = 3;
    activate(game, egg, 0);
    expect(pt(game, egg)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, egg).has("trample")).toBe(true);
    expect(counters(game, egg, "charge")).toBe(0);
  });
});

describe("Gemini Engine", () => {
  it("makes an attacking Twin with its P/T, sacrificed at end of combat", () => {
    const { game, a } = table();
    const engine = spawn(game, "Gemini Engine");
    attack(game, a, [engine]);
    expect(life(game, B)).toBe(20 - 3 - 3);
    expect(tokensNamed(game, "Twin Token")).toBe(0);
  });
});

describe("Stir the Pride", () => {
  it("granted mode: a creature that deals damage gains its controller that much life", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Stir the Pride"), { modes: [1] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Purge", () => {
  it("destroys an artifact creature or a black creature, not a green one", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const memnite = spawn(game, "Memnite", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Purge"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Purge"), { targets: [ref(memnite)] });
    expect(zone(game, memnite)).toBe("graveyard");
    const abom = spawn(game, "Nim Abomination", B);
    cast(game, toHand(game, "Purge"), { targets: [ref(abom)] });
    expect(zone(game, abom)).toBe("graveyard");
  });
});

describe("Tel-Jilad Wolf", () => {
  it("gets +3/+3 when blocked by an artifact creature, not by another creature", () => {
    const { game, a, b } = table();
    const wolf = spawn(game, "Tel-Jilad Wolf");
    const memnite = spawn(game, "Memnite", B);
    b.declareBlockersFn = () => [{ blocker: memnite, attacker: wolf }];
    a.declareAttackersFn = () => [{ attacker: wolf, defender: B }];
    toStep(game, "combat-damage");
    expect(pt(game, wolf)).toEqual({ power: 5, toughness: 5 });

    const t2 = table();
    const wolf2 = spawn(t2.game, "Tel-Jilad Wolf");
    const bears = spawn(t2.game, "Grizzly Bears", B);
    t2.b.declareBlockersFn = () => [{ blocker: bears, attacker: wolf2 }];
    t2.a.declareAttackersFn = () => [{ attacker: wolf2, defender: B }];
    toStep(t2.game, "combat-damage");
    expect(pt(t2.game, wolf2)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Nim Abomination", () => {
  it("costs 3 life at your end step only while untapped", () => {
    const { game } = table();
    spawn(game, "Nim Abomination");
    nextTurn(game);
    expect(life(game, A)).toBe(17);

    const t2 = table();
    spawn(t2.game, "Nim Abomination", A, { tapped: true });
    nextTurn(t2.game);
    expect(life(t2.game, A)).toBe(20);
    expect(named(t2.game, "Nim Abomination").length).toBe(1);
  });
});
