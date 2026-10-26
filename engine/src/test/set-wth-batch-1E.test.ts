/**
 * Weatherlight (WTH), group E. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

describe("Dingus Staff", () => {
  it("deals 2 damage to the dying creature's controller", () => {
    const { game } = table();
    spawn(game, "Dingus Staff");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Ancestral Knowledge", () => {
  it("exiles any number of the top ten and puts the rest back in the chosen order", () => {
    const { game, a } = table();
    const deep = toLibrary(game, "Island");
    const gone = toLibrary(game, "Forest");
    const top = toLibrary(game, "Mountain");
    const before = game.state.zones.perPlayer[A].library.length;
    let call = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      call += 1;
      // First the order (Island on top), then what to exile (the Forest).
      if (call === 1) return [deep, ...eligible.filter((id) => id !== deep)];
      return [gone];
    };
    enter(game, "Ancestral Knowledge");
    expect(call).toBe(2);
    expect(zone(game, gone)).toBe("exile");
    expect(zone(game, top)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.length).toBe(before - 1);
    expect(library[0]).toBe(deep);
  });
});

describe("Abduction", () => {
  it("untaps and steals the creature, and returns it to its owner when it dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Island", 4);
    cast(game, toHand(game, "Abduction"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    destroy(game, bears, A);
    const [back] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(B);
  });
});

describe("Thran Forge", () => {
  it("gives +1/+0 and makes the creature an artifact", () => {
    const { game } = table();
    const forge = spawn(game, "Thran Forge");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, forge, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(types(game, bears)).toContain("artifact");
  });
});

describe("Mana Chains", () => {
  it("gives the creature cumulative upkeep on its controller's upkeep", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Mana Chains"), { targets: [ref(bears)] });
    pickModes(b);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Cone of Flame", () => {
  it("deals 1, 2 and 3 damage to three different targets", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Cone of Flame"), { targets: [ref(B), ref(bears), ref(giant)] });
    expect(life(game, B)).toBe(19);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Tolarian Entrancer", () => {
  it("gains control of its blocker at end of combat, even having died", () => {
    const { game, a, b } = table();
    const entrancer = spawn(game, "Tolarian Entrancer");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: entrancer }];
    attack(game, a, [entrancer]);
    expect(zone(game, entrancer)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Cinder Wall", () => {
  it("is destroyed at end of combat after it blocks", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Cinder Wall", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wall)).toBe("graveyard");
  });
});

describe("Downdraft", () => {
  it("sacrificed, deals 2 damage to each creature with flying", () => {
    const { game } = table();
    const downdraft = spawn(game, "Downdraft");
    const drake = spawn(game, "Wind Drake", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, downdraft, 1);
    expect(zone(game, downdraft)).toBe("graveyard");
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wave of Terror", () => {
  it("destroys each creature with mana value equal to its age counters", () => {
    const { game, a } = table();
    const wave = spawn(game, "Wave of Terror");
    lands(game, "Wastes", 1);
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wave, "age")).toBe(1);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Roc Hatchling", () => {
  it("enters with four shell counters, and with none is a 3/3 flier", () => {
    const { game } = table();
    const roc = enter(game, "Roc Hatchling");
    expect(counters(game, roc, "shell")).toBe(4);
    expect(pt(game, roc)).toEqual({ power: 0, toughness: 1 });
    game.state.objects[roc].counters.shell = 1;
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, roc, "shell")).toBe(0);
    expect(pt(game, roc)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, roc).has("flying")).toBe(true);
  });
});

describe("Soul Shepherd", () => {
  it("exiles a creature card from the graveyard to gain 1 life", () => {
    const { game, a } = table();
    const shepherd = spawn(game, "Soul Shepherd");
    const card = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickFromZone(a, card);
    activate(game, shepherd);
    expect(zone(game, card)).toBe("exile");
    expect(life(game, A)).toBe(21);
  });
});
