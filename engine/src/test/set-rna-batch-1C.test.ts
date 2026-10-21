/**
 * Ravnica Allegiance, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Prime Speaker Vannifar", () => {
  it("finds a creature with mana value one more than the sacrificed one's", () => {
    const { game, a } = table();
    const vannifar = spawn(game, "Prime Speaker Vannifar");
    const memnite = spawn(game, "Memnite");
    const elves = toLibrary(game, "Llanowar Elves");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, elves);
    game.dispatch({ type: "activate-ability", player: A, source: vannifar, abilityIndex: 0, targets: [], sacrifice: memnite } as Action);
    game.advanceUntil((st) => st.zones.shared.stack.length === 0 && st.awaiting === null && st.pendingTriggers.length === 0);
    expect(zone(game, memnite)).toBe("graveyard");
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(bears);
    expect(named(game, "Llanowar Elves", A)).toHaveLength(1);
  });
});

describe("Biogenic Upgrade", () => {
  it("distributes three counters, then doubles the +1/+1 counters on each target", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[other].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Biogenic Upgrade"), { targets: [ref(bears), ref(memnite)], division: [2, 1] });
    expect(counters(game, bears)).toBe(6);
    expect(counters(game, memnite)).toBe(2);
    expect(counters(game, other)).toBe(1);
  });
});

describe("Spawn of Mayhem", () => {
  it("deals 1 to each player, then gets a counter only at 10 or less life", () => {
    const { game } = table();
    const spawnOf = spawn(game, "Spawn of Mayhem");
    game.state.players[A].life = 12;
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect(life(game, A)).toBe(11);
    expect(life(game, B)).toBe(19);
    expect(counters(game, spawnOf)).toBe(0);
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect(life(game, A)).toBe(10);
    expect(counters(game, spawnOf)).toBe(1);
  });
});

describe("Gates Ablaze", () => {
  it("deals damage equal to the Gates you control to each creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Gateway Plaza");
    spawn(game, "Azorius Guildgate");
    spawn(game, "Azorius Guildgate", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Gates Ablaze"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(game.state.objects[ogre].damageMarked).toBe(2);
  });
});

describe("Precognitive Perception", () => {
  it("scries 3 before drawing only when cast in your main phase", () => {
    const { game, a } = table();
    lands(game, "Island", 10);
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Precognitive Perception"));
    expect(scried).toBe(1);
    expect(hand(game).length).toBe(before + 3);
    toStep(game, "begin-combat");
    const later = hand(game).length;
    cast(game, toHand(game, "Precognitive Perception"));
    expect(scried).toBe(1);
    expect(hand(game).length).toBe(later + 3);
  });
});

describe("Collision // Colossus", () => {
  it("Collision deals 6 to a flier; Colossus gives +4/+2 and trample", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Collision // Colossus"), { face: 1, targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Collision // Colossus"), { face: 2, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Macabre Mockery", () => {
  it("steals an opponent's creature card with +2/+0 and haste, sacrificed at the end step", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Macabre Mockery"), { targets: [ref(bears)] });
    const stolen = named(game, "Grizzly Bears", A)[0];
    expect(stolen).toBeDefined();
    expect(controller(game, stolen)).toBe(A);
    expect(pt(game, stolen)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, stolen).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(graveyard(game, B).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Thrash // Threat", () => {
  it("Threat makes a 4/4 red and green Beast with trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Thrash // Threat"), { face: 2 });
    const beast = named(game, "Beast Token (Red-Green)", A)[0];
    expect(beast).toBeDefined();
    expect(pt(game, beast)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, beast).has("trample")).toBe(true);
  });

  it("Thrash: your creature deals damage equal to its power, taking none back", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ogre = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Thrash // Threat"), { face: 1, targets: [ref(ogre), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[ogre].damageMarked).toBe(0);
  });
});

describe("Sentinel's Mark", () => {
  it("grants lifelink only when cast during your main phase", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Sentinel's Mark"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    toStep(game, "begin-combat");
    cast(game, toHand(game, "Sentinel's Mark"), { targets: [ref(other)] });
    expect(keywords(game, other).has("vigilance")).toBe(true);
    expect(keywords(game, other).has("lifelink")).toBe(false);
  });
});

describe("Silhana Wayfinder", () => {
  it("puts a chosen creature or land on top and the rest on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const shock = toLibrary(game, "Shock");
    const seen = pickFromZone(a, bears);
    enter(game, "Silhana Wayfinder");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(shock);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(bears);
    expect(library.slice(-3)).toContain(shock);
  });
});

describe("Sky Tether", () => {
  it("gives defender and takes flying away", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const drake = spawn(game, "Wind Drake", B);
    cast(game, toHand(game, "Sky Tether"), { targets: [ref(drake)] });
    expect(keywords(game, drake).has("flying")).toBe(false);
    expect(keywords(game, drake).has("defender")).toBe(true);
  });
});

describe("Blade Juggler", () => {
  it("deals 1 damage to you and draws a card as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Blade Juggler");
    expect(life(game, A)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Clan Guildmage", () => {
  it("turns a land you control into a 4/4 Elemental with haste", () => {
    const { game } = table();
    const guildmage = spawn(game, "Clan Guildmage");
    lands(game, "Forest", 3);
    const wastes = spawn(game, "Wastes");
    activate(game, guildmage, 1, { targets: [ref(wastes)] });
    expect(pt(game, wastes)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, wastes).has("haste")).toBe(true);
  });
});

describe("Bloodmist Infiltrator", () => {
  it("sacrificing another creature as it attacks makes it unblockable", () => {
    const { game, a } = table();
    const infiltrator = spawn(game, "Bloodmist Infiltrator");
    const memnite = spawn(game, "Memnite");
    pickModes(a, 0);
    pickPermanents(a, memnite);
    a.declareAttackersFn = () => [{ attacker: infiltrator, defender: B }];
    toStep(game, "declare-blockers");
    const unblockable = keywords(game, infiltrator).has("unblockable");
    expect(zone(game, memnite)).toBe("graveyard");
    expect(unblockable).toBe(true);
  });
});

describe("Smelt-Ward Ignus", () => {
  it("steals a creature with power 3 or less, untapped and hasty", () => {
    const { game } = table();
    const ignus = spawn(game, "Smelt-Ward Ignus");
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const angel = spawn(game, "Serra Angel", B);
    const refused = game.canDispatch({
      type: "activate-ability",
      player: A,
      source: ignus,
      abilityIndex: 0,
      targets: [ref(angel)],
    });
    expect(refused).not.toBeNull();
    activate(game, ignus, 0, { targets: [ref(bears)] });
    expect(zone(game, ignus)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
