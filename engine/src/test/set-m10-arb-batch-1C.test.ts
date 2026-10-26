/**
 * Magic 2010 (M10) and Alara Reborn (ARB) — B168, group C. One test per card
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
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
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

describe("Xathrid Demon", () => {
  it("sacrifices another creature and drains each opponent by its power", () => {
    const { game, a } = table();
    const demon = spawn(game, "Xathrid Demon");
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a, giant);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, demon)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("with no other creature, taps itself and you lose 7 life", () => {
    const { game } = table();
    const demon = spawn(game, "Xathrid Demon");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("battlefield");
    expect(game.state.objects[demon].tapped).toBe(true);
    expect(life(game, A)).toBe(13);
    expect(life(game, B)).toBe(20);
  });
});

describe("Entangling Vines", () => {
  it("can't target an untapped creature", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Entangling Vines"), { targets: [ref(bears)] })).toThrow();
  });

  it("goes to the graveyard once the enchanted creature is untapped", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const vines = toHand(game, "Entangling Vines");
    cast(game, vines, { targets: [ref(bears)] });
    expect(game.state.objects[vines].attachedTo).toBe(bears);
    game.state.objects[bears].tapped = false;
    toStep(game, "end");
    expect(zone(game, vines)).toBe("graveyard");
  });
});

describe("Finest Hour", () => {
  it("untaps the lone attacker and adds a second combat, exalted in each", () => {
    const { game, a } = table();
    spawn(game, "Finest Hour");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    // First combat 3 (exalted), second combat 4 (exalted twice); the untap
    // trigger doesn't fire in the second combat.
    expect(life(game, B)).toBe(13);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Lich Lord of Unx", () => {
  it("drains and mills X, the Zombies you control", () => {
    const { game } = table();
    const lich = spawn(game, "Lich Lord of Unx");
    spawn(game, "Zombie Wizard Token");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const before = graveyard(game, B).length;
    activate(game, lich, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(graveyard(game, B).length).toBe(before + 2);
  });
});

describe("Slave of Bolas", () => {
  it("steals and untaps a creature with haste, sacrificed at the end step", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Slave of Bolas"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(giant);
  });
});

describe("Skyclaw Thrash", () => {
  it("attacks as a 4/4 or, on a won flip, a 5/5 flier", () => {
    const { game, a } = table();
    const thrash = spawn(game, "Skyclaw Thrash");
    attack(game, a, [thrash]);
    const flying = keywords(game, thrash).has("flying");
    expect(pt(game, thrash)).toEqual(flying ? { power: 5, toughness: 5 } : { power: 4, toughness: 4 });
    expect(life(game, B)).toBe(flying ? 15 : 16);
  });
});

describe("Spellbound Dragon", () => {
  it("gets +X/+0 for the discarded card's mana value", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Spellbound Dragon");
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    attack(game, a, [dragon]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, dragon)).toEqual({ power: 7, toughness: 5 });
    expect(life(game, B)).toBe(13);
  });
});

describe("Defiler of Souls", () => {
  it("makes the active player sacrifice a monocolored creature, never a multicolored or colorless one", () => {
    const { game, b } = table();
    spawn(game, "Defiler of Souls");
    const bomber = spawn(game, "Kathari Bomber", B);
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(b, bears);
    nextTurn(game, "draw");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bomber)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(seen.offered).not.toContain(bomber);
  });
});

describe("Kathari Bomber", () => {
  it("makes two Goblins and is sacrificed when it deals combat damage", () => {
    const { game, a } = table();
    const bomber = spawn(game, "Kathari Bomber");
    attack(game, a, [bomber]);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    expect(zone(game, bomber)).toBe("graveyard");
  });
});

describe("Esper Sojourners", () => {
  it("may tap target permanent when it dies", () => {
    const { game, a } = table();
    const sojourners = spawn(game, "Esper Sojourners");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    destroy(game, sojourners);
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Brainbite", () => {
  it("takes the chosen card and draws you one", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const giant = toHand(game, "Hill Giant", B);
    const bite = toHand(game, "Brainbite");
    const before = game.state.zones.perPlayer[A].hand.length;
    pickFromZone(a, giant);
    cast(game, bite, { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before);
  });
});

describe("Nulltread Gargantuan", () => {
  it("puts the chosen creature you control on top of its owner's library", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, bears);
    const gargantuan = enter(game, "Nulltread Gargantuan");
    expect(seen.offered).toContain(gargantuan);
    expect(zone(game, bears)).toBe("library");
    // The top card is the next one drawn.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(bears);
    expect(zone(game, gargantuan)).toBe("battlefield");
  });
});

describe("Illusory Demon", () => {
  it("is sacrificed when you cast a spell", () => {
    const { game } = table();
    const demon = spawn(game, "Illusory Demon");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, demon)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });
});
