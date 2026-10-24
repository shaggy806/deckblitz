/**
 * Battle for Zendikar (BFZ) — group c: rally, landfall, devoid, ingest,
 * converge and equipment cards.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Guardian of Tazeem", () => {
  it("taps the target; only an Island keeps it from untapping", () => {
    const { game, a } = table();
    spawn(game, "Guardian of Tazeem");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Wastes");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[bears].skipsNextUntap ?? false).toBe(false);

    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, other);
    enter(game, "Island");
    expect(game.state.objects[other].tapped).toBe(true);
    expect(game.state.objects[other].skipsNextUntap).toBe(true);
  });
});

describe("Pathway Arrows", () => {
  it("the equipped creature's ping taps a colorless creature, not a coloured one", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const bears = spawn(game, "Grizzly Bears");
    const arrows = spawn(game, "Pathway Arrows");
    activate(game, arrows, 0, { targets: [ref(bears)] });
    const drifter = spawn(game, "Tide Drifter", B);
    activate(game, bears, 0, { targets: [ref(drifter)] });
    expect(game.state.objects[drifter].damageMarked).toBe(1);
    expect(game.state.objects[drifter].tapped).toBe(true);

    const { game: g2 } = table();
    lands(g2, "Wastes", 6);
    const bears2 = spawn(g2, "Grizzly Bears");
    const arrows2 = spawn(g2, "Pathway Arrows");
    activate(g2, arrows2, 0, { targets: [ref(bears2)] });
    const coloured = spawn(g2, "Tajuru Beastmaster", B);
    activate(g2, bears2, 0, { targets: [ref(coloured)] });
    expect(g2.state.objects[coloured].damageMarked).toBe(1);
    expect(g2.state.objects[coloured].tapped).toBe(false);
  });
});

describe("Barrage Tyrant", () => {
  it("deals damage equal to the sacrificed colorless creature's power", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const tyrant = spawn(game, "Barrage Tyrant");
    const skyspawner = spawn(game, "Eldrazi Skyspawner");
    const bears = spawn(game, "Grizzly Bears");
    const act = (sacrifice: ObjectId) =>
      ({ type: "activate-ability", player: A, source: tyrant, abilityIndex: 0, targets: [ref(B)], sacrifice }) as Action;
    expect(game.canDispatch(act(bears))).not.toBeNull(); // coloured: not a legal sacrifice
    expect(game.canDispatch(act(tyrant))).not.toBeNull(); // "another"
    game.dispatch(act(skyspawner));
    settle(game);
    expect(zone(game, skyspawner)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Slab Hammer", () => {
  it("returning a land gives the attacker +2/+2", () => {
    const { game, a } = table();
    const wastes = lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Slab Hammer");
    activate(game, hammer, 0, { targets: [ref(bears)] });
    pickPermanents(a, wastes[0]);
    attack(game, a, [bears]);
    expect(zone(game, wastes[0])).toBe("hand");
    expect(life(game, B)).toBe(16);
  });
});

describe("Akoum Firebird", () => {
  it("landfall pays {4}{R}{R} to return it from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 4);
    const bird = toGraveyard(game, "Akoum Firebird");
    pickModes(a, 0);
    enter(game, "Wastes");
    expect(zone(game, bird)).toBe("battlefield");
  });
});

describe("Kiora, Master of the Depths", () => {
  it("−8: the emblem comes first, so each Octopus may fight as it enters", () => {
    const { game, a } = table();
    const kiora = spawn(game, "Kiora, Master of the Depths");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    // The three triggers go on the stack together, so each targets a different Bears.
    let n = 0;
    watchTargets(a, () => [theirs[n++]]);
    pickModes(a, 0);
    loyalty(game, kiora, -8, { atLeast: 8 });
    expect(tokensNamed(game, "Octopus Token", A)).toBe(3);
    for (const bears of theirs) expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Munda, Ambush Leader", () => {
  it("puts the chosen Allies on top and the rest on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const scout = toLibrary(game, "Lantern Scout");
    const steward = toLibrary(game, "Serene Steward");
    const forest = toLibrary(game, "Forest");
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      if (asked === 1) {
        expect(eligible).toEqual(expect.arrayContaining([scout, steward]));
        expect(eligible).not.toContain(bears);
        return [steward, scout];
      }
      return eligible;
    };
    pickModes(a, 0);
    enter(game, "Munda, Ambush Leader");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(0, 2)).toEqual([steward, scout]);
    expect(library.slice(-2)).toEqual(expect.arrayContaining([bears, forest]));
  });
});

describe("Tajuru Warcaller and Lantern Scout", () => {
  it("rally triggers for itself and for another Ally", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Tajuru Warcaller");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    enter(game, "Lantern Scout");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Unnatural Aggression", () => {
  it("the opponent's creature that dies this turn is exiled", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    const mine = spawn(game, "Tajuru Beastmaster");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Unnatural Aggression"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.objects[mine].damageMarked).toBe(2);
  });
});

describe("Serene Steward", () => {
  it("paying {W} on a life gain puts a +1/+1 counter on the target", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    const steward = spawn(game, "Serene Steward");
    pickTargets(a, steward);
    pickModes(a, 0);
    cast(game, toHand(game, "Nourish"));
    expect(life(game, A)).toBe(26);
    expect(counters(game, steward)).toBe(1);
  });
});

describe("Fathom Feeder", () => {
  it("ingests on combat damage; its ability draws and each opponent exiles their top card", () => {
    const { game, a } = table();
    const feeder = spawn(game, "Fathom Feeder");
    const exiled = (owner: string): number =>
      game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === owner).length;
    attack(game, a, [feeder]);
    expect(exiled(B)).toBe(1);

    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const before = hand(game).length;
    activate(game, feeder, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(exiled(B)).toBe(2);
    expect(exiled(A)).toBe(0);
  });
});

describe("Gruesome Slaughter", () => {
  it("only colorless creatures you control gain the power-damage ability", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const skyspawner = spawn(game, "Eldrazi Skyspawner");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gruesome Slaughter"));
    expect(() => activate(game, bears, 0, { targets: [ref(theirs)] })).toThrow();
    activate(game, skyspawner, 0, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Skyrider Elf", () => {
  it("enters with a counter per colour spent, X letting more colours be spent", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    const elf = toHand(game, "Skyrider Elf");
    cast(game, elf, { x: 1 });
    expect(zone(game, elf)).toBe("battlefield");
    expect(counters(game, elf)).toBe(3);
  });
});

describe("Brilliant Spectrum", () => {
  it("draws one per colour spent, then discards two", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const spell = toHand(game, "Brilliant Spectrum");
    const before = hand(game).length;
    cast(game, spell);
    settle(game);
    expect(hand(game).length).toBe(before - 1 + 2 - 2);
    expect(graveyard(game).length).toBe(3);
  });
});
