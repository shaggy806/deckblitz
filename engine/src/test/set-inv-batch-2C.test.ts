/**
 * Invasion (INV; B232) — group C: kicker, Kavu, Winnow's same-name check and
 * Metathran Aerostat's "if you do".
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  enter,
  counters,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Explosive Growth", () => {
  it("gives +2/+2, or +5/+5 kicked", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Explosive Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    cast(game, toHand(game, "Explosive Growth"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Hypnotic Cloud", () => {
  it("makes the player discard one, or three kicked", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Hypnotic Cloud"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    cast(game, toHand(game, "Hypnotic Cloud"), { targets: [ref(B)], kicked: true });
    expect(hand(game, B).length).toBe(before - 4);
  });
});

describe("Marauding Knight", () => {
  it("counts only the Plains its opponents control", () => {
    const { game } = table();
    const knight = spawn(game, "Marauding Knight");
    lands(game, "Plains", 2, B);
    lands(game, "Plains", 1, A);
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Kavu Monarch", () => {
  it("gives every Kavu creature trample and grows when another Kavu enters", () => {
    const { game } = table();
    const monarch = enter(game, "Kavu Monarch");
    expect(counters(game, monarch)).toBe(0);
    expect(keywords(game, monarch).has("trample")).toBe(true);
    const theirs = enter(game, "Rogue Kavu", B);
    expect(keywords(game, theirs).has("trample")).toBe(true);
    expect(counters(game, monarch)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, monarch)).toBe(1);
  });
});

describe("Pyre Zombie", () => {
  it("returns from the graveyard at upkeep for {1}{B}{B}", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const zombie = toGraveyard(game, "Pyre Zombie");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, zombie)).toBe("hand");
  });

  it("sacrifices itself to deal 2 damage to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const zombie = spawn(game, "Pyre Zombie");
    activate(game, zombie, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, zombie)).toBe("graveyard");
  });
});

describe("Winnow", () => {
  it("destroys the target only when another permanent shares its name, and draws either way", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const lone = spawn(game, "Grizzly Bears", B);
    let before = hand(game).length;
    cast(game, toHand(game, "Winnow"), { targets: [ref(lone)] });
    expect(zone(game, lone)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
    // A second copy under the same opponent.
    spawn(game, "Grizzly Bears", B);
    before = hand(game).length;
    cast(game, toHand(game, "Winnow"), { targets: [ref(lone)] });
    expect(zone(game, lone)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("counts a copy under another controller", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Raging Goblin");
    const theirs = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Winnow"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    const angel = spawn(game, "Serra Angel");
    const theirAngel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Winnow"), { targets: [ref(theirAngel)] });
    expect(zone(game, theirAngel)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Metathran Aerostat", () => {
  it("puts a creature card with mana value X from hand and returns itself", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const aerostat = spawn(game, "Metathran Aerostat");
    const bears = toHand(game, "Grizzly Bears");
    const pick = pickFromZone(a, bears);
    activate(game, aerostat, 0, { x: 2 });
    expect(pick.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, aerostat)).toBe("hand");
  });

  it("stays when nothing is put onto the battlefield", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const aerostat = spawn(game, "Metathran Aerostat");
    const bears = toHand(game, "Grizzly Bears");
    activate(game, aerostat, 0, { x: 3 });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, aerostat)).toBe("battlefield");
  });
});

describe("Defiling Tears", () => {
  it("makes the creature black, +1/-1, and able to regenerate for {B}", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Defiling Tears"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 1 });
    expect([...computeCharacteristics(game.state, game.registry, bears).colors]).toEqual(["B"]);
    activate(game, bears, 0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wallop", () => {
  it("targets only a blue or black creature with flying", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const birds = spawn(game, "Birds of Paradise", B);
    const drake = spawn(game, "Wind Drake", B);
    expect(() => cast(game, toHand(game, "Wallop"), { targets: [ref(birds)] })).toThrow();
    cast(game, toHand(game, "Wallop"), { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Rogue Kavu", () => {
  it("gets +2/+0 attacking alone", () => {
    const { game, a } = table();
    const kavu = spawn(game, "Rogue Kavu");
    attack(game, a, [kavu]);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});
