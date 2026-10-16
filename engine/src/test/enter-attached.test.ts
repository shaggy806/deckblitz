/**
 * Cards put onto the battlefield attached to something (`effect:attach-
 * extensions`): `put-onto-battlefield`'s and `return-from-graveyard`'s
 * `attachedTo`, and `search-library`'s `attachedToSource`. An Aura that
 * can't legally enchant it stays where it is (rule 303.4i); an Equipment
 * that can't equip it enters unattached (301.5e). And `attach`'s `choose`
 * on Equipment — Beatrix, Battlefield Improvisation, Vow to Erebor.
 */
import { describe, expect, it } from "vitest";

import {
  B,
  activate,
  attack,
  cast,
  enter,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const attachedTo = (game: ReturnType<typeof table>["game"], id: string) =>
  game.state.objects[id as keyof typeof game.state.objects].attachedTo ?? null;

describe("Danitha, Benalia's Hope", () => {
  it("puts an Aura from hand onto the battlefield attached to Danitha", () => {
    const { game, a } = table();
    const mantle = toHand(game, "Spirit Mantle");
    toGraveyard(game, "Short Sword");
    pickModes(a, 0);
    pickFromZone(a, mantle);
    const danitha = enter(game, "Danitha, Benalia's Hope");
    expect(zone(game, mantle)).toBe("battlefield");
    expect(attachedTo(game, mantle)).toBe(danitha);
  });

  it("an Aura that can't enchant Danitha stays in hand", () => {
    const { game, a } = table();
    const growth = toHand(game, "Wild Growth");
    pickModes(a, 0);
    pickFromZone(a, growth);
    enter(game, "Danitha, Benalia's Hope");
    expect(zone(game, growth)).toBe("hand");
  });

  it("puts an Equipment from the graveyard onto the battlefield attached to Danitha", () => {
    const { game, a } = table();
    const sword = toGraveyard(game, "Short Sword");
    pickModes(a, 0);
    pickFromZone(a, sword);
    const danitha = enter(game, "Danitha, Benalia's Hope");
    expect(zone(game, sword)).toBe("battlefield");
    expect(attachedTo(game, sword)).toBe(danitha);
  });
});

describe("Magnetic Snuffler", () => {
  it("returns target Equipment card attached to itself", () => {
    const { game, a } = table();
    const splitter = toGraveyard(game, "Bonesplitter");
    pickTargets(a, splitter);
    const snuffler = enter(game, "Magnetic Snuffler");
    expect(attachedTo(game, splitter)).toBe(snuffler);
    expect(pt(game, snuffler)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Smoke Shroud", () => {
  it("returns from the graveyard attached to a Ninja you control as it enters", () => {
    const { game, a } = table();
    const shroud = toGraveyard(game, "Smoke Shroud");
    pickModes(a, 0);
    const ninja = enter(game, "Ninja of the Deep Hours");
    expect(zone(game, shroud)).toBe("battlefield");
    expect(attachedTo(game, shroud)).toBe(ninja);
  });
});

describe("Eagle's Rescue", () => {
  it("returns from the graveyard attached to target creature you control with power 1 or less", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const rescue = toGraveyard(game, "Eagle's Rescue");
    const elf = spawn(game, "Llanowar Elves");
    activate(game, rescue, 0, { targets: [ref(elf)] });
    expect(attachedTo(game, rescue)).toBe(elf);
    expect(pt(game, elf)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Unfinished Business", () => {
  it("returns the creature, then an Aura and an Equipment attached to it; one that can't stays", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const mantle = toGraveyard(game, "Spirit Mantle");
    const sword = toGraveyard(game, "Short Sword");
    cast(game, toHand(game, "Unfinished Business"), { targets: [ref(bears), ref(mantle), ref(sword)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(attachedTo(game, mantle)).toBe(bears);
    expect(attachedTo(game, sword)).toBe(bears);
  });

  it("an Aura that can't enchant that creature remains in the graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const growth = toGraveyard(game, "Wild Growth");
    cast(game, toHand(game, "Unfinished Business"), { targets: [ref(bears), ref(growth), null] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, growth)).toBe("graveyard");
  });
});

describe("attaching chosen Equipment", () => {
  it("Beatrix attaches any number of Equipment you control to target creature you control", () => {
    const { game, a } = table();
    spawn(game, "Beatrix, Loyal General");
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    const sword = spawn(game, "Short Sword");
    pickTargets(a, bears);
    pickPermanents(a, splitter, sword);
    attack(game, a, []);
    expect(attachedTo(game, splitter)).toBe(bears);
    expect(attachedTo(game, sword)).toBe(bears);
  });

  it("Battlefield Improvisation attaches only to an attacking creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [splitter];
    };
    cast(game, toHand(game, "Battlefield Improvisation"), { targets: [ref(bears)] });
    expect(asked).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Battlefield Improvisation"), { targets: [ref(bears)] });
    expect(asked).toBe(true);
    expect(attachedTo(game, splitter)).toBe(bears);
  });

  it("Vow to Erebor attaches up to one Equipment, to a Dwarf only", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const dwarf = spawn(game, "Dwarven Warriors");
    const splitter = spawn(game, "Bonesplitter");
    let max = 0;
    a.choosePermanentsFn = (_view, _eligible, _min, most) => {
      max = most;
      return [splitter];
    };
    cast(game, toHand(game, "Vow to Erebor"), { targets: [ref(bears)] });
    expect(attachedTo(game, splitter)).toBe(null);
    spawn(game, "Short Sword");
    cast(game, toHand(game, "Vow to Erebor"), { targets: [ref(dwarf)] });
    expect(max).toBe(1);
    expect(attachedTo(game, splitter)).toBe(dwarf);
  });
});
