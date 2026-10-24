/**
 * Shadows over Innistrad, group B. One test per clause most likely to be
 * wrong: Topplegeist's "creature that player controls" on an opponent's
 * upkeep, Wolf of Devil's Breach's discarded mana value, Goldnight
 * Castigator's two doublings, Slayer's Plate's "if it was a Human",
 * Confront the Unknown counting the new Clue, Strength of Arms's Equipment
 * gate, Might Beyond Reason's delirium, Mindwrack Demon's unless-delirium
 * life loss, Invocation of Saint Traft's exiled Angel, Heir of Falkenrath's
 * transform, Apothecary Geist's other Spirit, Structural Distortion's damage
 * to the controller, Skeleton Key's skulk, Call the Bloodline's once a turn,
 * Sinister Concoction's costs and Angelic Purge's sacrifice.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** Four card types in `player`'s graveyard: creature, instant, sorcery, artifact. */
function delirium(game: Game, player = A): void {
  for (const name of ["Grizzly Bears", "Shock", "Divination", "Sol Ring"]) toGraveyard(game, name, player);
}

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Topplegeist", () => {
  it("taps a creature of the opponent whose upkeep it is, and only theirs", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Topplegeist");
    delirium(game);
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    // Bob's creature is the only legal target, so it's taken without asking.
    const seen = watchTargets(a, (offered) => [offered[0][0]]);
    nextTurn(game); // bob's turn, past his upkeep
    expect(seen.asked).toBe(0);
    expect(tapped(game, bobs)).toBe(true);
    expect(tapped(game, mine) || tapped(game, carols)).toBe(false);
  });

  it("doesn't trigger without delirium", () => {
    const { game } = table();
    spawn(game, "Topplegeist");
    const bobs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(tapped(game, bobs)).toBe(false);
  });
});

describe("Wolf of Devil's Breach", () => {
  it("deals damage equal to the discarded card's mana value", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const wolf = spawn(game, "Wolf of Devil's Breach");
    const bears = spawn(game, "Craw Wurm", B);
    const divination = toHand(game, "Divination");
    a.chooseDiscardsFn = () => [divination];
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [wolf]);
    expect(zone(game, divination)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(3);
  });
});

describe("Goldnight Castigator", () => {
  it("doubles damage to its controller and to itself, not to their other creatures", () => {
    const { game } = table();
    const angel = spawn(game, "Goldnight Castigator");
    const bears = spawn(game, "Craw Wurm");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(angel)]);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)]);
    expect(life(game)).toBe(16);
    expect(game.state.objects[angel].damageMarked).toBe(6);
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Slayer's Plate", () => {
  it("makes a Spirit when the equipped creature dies only if it was a Human", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const plate = spawn(game, "Slayer's Plate");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, plate, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token")).toBe(0);
    const human = spawn(game, "Tooth Collector");
    activate(game, plate, 0, { targets: [ref(human)] });
    destroy(game, human);
    expect(tokensNamed(game, "Spirit Token")).toBe(1);
  });
});

describe("Confront the Unknown", () => {
  it("counts the Clue it just made", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Clue Token");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Confront the Unknown"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Clue Token")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Strength of Arms", () => {
  it("makes a Human Soldier only while you control an Equipment", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Strength of Arms"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(tokensNamed(game, "Human Soldier Token")).toBe(0);
    spawn(game, "Skeleton Key");
    cast(game, toHand(game, "Strength of Arms"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Human Soldier Token")).toBe(1);
  });
});

describe("Might Beyond Reason", () => {
  it("puts two counters, three with delirium", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Might Beyond Reason"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    delirium(game);
    cast(game, toHand(game, "Might Beyond Reason"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(5);
  });
});

describe("Mindwrack Demon", () => {
  it("costs 4 life each upkeep without delirium, nothing with it", () => {
    const { game } = table();
    spawn(game, "Mindwrack Demon");
    toStep(game, "precombat-main"); // alice's next turn
    expect(life(game)).toBe(16);
    expect(life(game, B)).toBe(20);
    delirium(game);
    toStep(game, "precombat-main");
    expect(life(game)).toBe(16);
  });
});

describe("Invocation of Saint Traft", () => {
  it("brings a 4/4 Angel into the attack and exiles it at end of combat", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Invocation of Saint Traft"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "4/4 Angel Token")).toBe(0);
  });
});

describe("Heir of Falkenrath", () => {
  it("discards a card to transform into a 3/2 flier, once a turn", () => {
    const { game } = table();
    const heir = spawn(game, "Heir of Falkenrath");
    const before = hand(game).length;
    activate(game, heir);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, heir)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, heir).has("flying")).toBe(true);
  });
});

describe("Apothecary Geist", () => {
  it("gains 3 life only with another Spirit", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    cast(game, toHand(game, "Apothecary Geist"));
    expect(life(game)).toBe(20);
    cast(game, toHand(game, "Apothecary Geist"));
    expect(life(game)).toBe(23);
  });
});

describe("Structural Distortion", () => {
  it("exiles an artifact and deals 2 damage to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Structural Distortion"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("exile");
    expect(life(game, B)).toBe(18);
  });
});

describe("Skeleton Key", () => {
  it("gives skulk and loots on combat damage", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const key = spawn(game, "Skeleton Key");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, key, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("skulk")).toBe(true);
    const before = hand(game).length;
    const yard = graveyard(game).length;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(yard + 1);
  });
});

describe("Call the Bloodline", () => {
  it("makes a lifelink Vampire Knight once each turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const call = spawn(game, "Call the Bloodline");
    activate(game, call);
    expect(tokensNamed(game, "Vampire Knight Token")).toBe(1);
    expect(() => activate(game, call)).toThrow();
  });
});

describe("Sinister Concoction", () => {
  it("pays life, mills, discards and sacrifices itself to destroy a creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const concoction = spawn(game, "Sinister Concoction");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    activate(game, concoction, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, concoction)).toBe("graveyard");
    expect(life(game)).toBe(19);
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game).length).toBe(3); // the milled card, the discard, the Concoction
  });
});

describe("Angelic Purge", () => {
  it("sacrifices a permanent to exile an artifact, creature or enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const fodder = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Angelic Purge"), { targets: [ref(bears)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});
