/**
 * Conflux and Shards of Alara (CON/ALA; B171), group D. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  enter,
  pickFromZone,
} from "./harness.js";

describe("Corpse Connoisseur", () => {
  it("may put a creature card from the library into the graveyard as it enters", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", A);
    pickModes(a, 0);
    pickFromZone(a, bears);
    enter(game, "Corpse Connoisseur");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Brackwater Elemental", () => {
  it("is sacrificed at the next end step after it attacks", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Brackwater Elemental");
    attack(game, a, [elemental]);
    expect(zone(game, elemental)).toBe("battlefield");
    toStep(game, "cleanup");
    expect(zone(game, elemental)).toBe("graveyard");
  });
});

describe("Knight-Captain of Eos", () => {
  it("sacrifices a Soldier to prevent all combat damage this turn", () => {
    const { game, a } = table();
    enter(game, "Knight-Captain of Eos");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const captain = named(game, "Knight-Captain of Eos", A)[0];
    const soldier = named(game, "Soldier Token", A)[0];
    game.dispatch({ type: "activate-ability", player: A, source: captain, abilityIndex: 0, targets: [], sacrifice: soldier });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    const before = life(game, B);
    attack(game, a, [captain]);
    expect(life(game, B)).toBe(before);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Rafiq of the Many", () => {
  it("gives a lone attacker +1/+1 and double strike", () => {
    const { game, a } = table();
    spawn(game, "Rafiq of the Many");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(life(game, B)).toBe(14);
  });
});

describe("Vicious Shadows", () => {
  it("deals damage equal to the targeted player's hand size when a creature dies", () => {
    const { game, a } = table();
    spawn(game, "Vicious Shadows");
    const bears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Wastes", B);
    const cards = hand(game, B).length;
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    pickTargets(a, B); // the trigger's target
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - cards);
  });
});

describe("Keeper of Progenitus", () => {
  it("adds an extra mana for a Forest but not an Island", () => {
    const { game } = table();
    spawn(game, "Keeper of Progenitus");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears); // {1}{G} from one Forest
    expect(zone(game, bears)).toBe("battlefield");
    lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Mind Stone"))).toThrow(); // an Island isn't doubled
  });
});

describe("Mark of Asylum", () => {
  it("prevents noncombat damage to your creatures only", () => {
    const { game } = table();
    spawn(game, "Mark of Asylum");
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Telemin Performance", () => {
  it("mills the opponent's noncreature cards and steals the creature", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    const top = toLibrary(game, "Island", B);
    lands(game, "Island", 5);
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Telemin Performance"), { targets: [{ kind: "player", player: B }] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, top)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(before + 1);
  });
});

describe("Esperzoa", () => {
  it("returns itself at upkeep when it is your only artifact", () => {
    const { game } = table();
    const zoa = spawn(game, "Esperzoa");
    toStep(game, "draw");
    expect(zone(game, zoa)).toBe("hand");
  });
});

describe("Spore Burst", () => {
  it("makes a Saproling per basic land type", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Spore Burst"));
    expect(tokensNamed(game, "Saproling Token", A)).toBe(3);
  });
});

describe("Vectis Agents", () => {
  it("gets -2/-0 and can't be blocked", () => {
    const { game } = table();
    const agents = spawn(game, "Vectis Agents");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    activate(game, agents, 0);
    expect(pt(game, agents)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, agents).has("unblockable")).toBe(true);
  });
});

describe("Manaplasm", () => {
  it("gets +X/+X for the spell's mana value", () => {
    const { game } = table();
    const ooze = spawn(game, "Manaplasm");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    settle(game);
    expect(pt(game, ooze)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Corpse Connoisseur unearth", () => {
  it("returns from the graveyard with haste", () => {
    const { game } = table();
    const card = toGraveyard(game, "Corpse Connoisseur");
    lands(game, "Swamp", 4);
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("haste")).toBe(true);
  });
});
