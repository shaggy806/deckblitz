/**
 * "The same name as" another named object (rule 201.2a): `ShareReference`'s `{ graveyard }`, read
 * live in a trigger's filter (Pyromancer Ascension, Dragonlord Kolaghan) and in a resolving
 * condition (Bazaar of Wonders); `sameNameAsTriggerObject` in a search, named as the creature last
 * existed (Remembrance, Verdant Succession); `sameNameAsAnother` and `destroy-all`'s
 * `exceptTriggerObject` (Eye of Singularity); and the imprinted card's name read by a trigger and a
 * static's count (Invader Parasite, Extraplanar Lens, Strata Scythe).
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const pool = (game: Game, p: PlayerId = A) => poolCounts(game.state.players[p].manaPool);

describe("Pyromancer Ascension: a spell named like a card in your graveyard", () => {
  it("gets a counter for a namesake in your graveyard, none for one in an opponent's", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Pyromancer Ascension");
    pickModes(a, 0);
    lands(game, "Mountain", 3);
    toGraveyard(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(0);
    // That first Bolt is in Alice's graveyard now.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(1);
  });

  it("a split card in the graveyard shares a name with either half (rule 201.2a)", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Pyromancer Ascension");
    pickModes(a, 0);
    lands(game, "Mountain", 3);
    toGraveyard(game, "Fire // Ice");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(0);
    cast(game, toHand(game, "Fire // Ice"), { face: 1, targets: [ref(B)], division: [2] });
    expect(counters(game, ascension, "quest")).toBe(1);
  });

  it("the bound name too: Aven Shrine counts a split card in a graveyard for a spell cast as one half", () => {
    const { game } = table();
    spawn(game, "Aven Shrine", B);
    lands(game, "Mountain", 2);
    toGraveyard(game, "Fire // Ice", B);
    toGraveyard(game, "Shock", B);
    cast(game, toHand(game, "Fire // Ice"), { face: 1, targets: [ref(B)], division: [2] });
    expect(life(game, A)).toBe(21);
  });

  it("copies from two counters; the counter that makes the second comes too late for that cast", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Pyromancer Ascension");
    pickModes(a, 0);
    lands(game, "Mountain", 2);
    game.state.objects[ascension].counters["quest"] = 1;
    toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(2);
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, ascension, "quest")).toBe(3);
    expect(life(game, B)).toBe(11);
  });
});

describe("Dragonlord Kolaghan: a card in the caster's own graveyard", () => {
  it("an opponent loses 10 for a namesake in their graveyard, not in anyone else's, and not for a noncreature", () => {
    const { game } = table();
    spawn(game, "Dragonlord Kolaghan");
    lands(game, "Forest", 4, B);
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    toGraveyard(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(life(game, B)).toBe(20);
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(life(game, B)).toBe(10);
    toGraveyard(game, "Shock", B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, B)).toBe(10);
  });
});

describe("Bazaar of Wonders: counter it if a namesake is in a graveyard or on the battlefield", () => {
  it("counters for a card in any graveyard, or a nontoken permanent; lets anything else resolve", () => {
    const { game } = table();
    spawn(game, "Bazaar of Wonders", B);
    lands(game, "Forest", 6);
    toGraveyard(game, "Elvish Mystic", B);
    const fromGraveyard = toHand(game, "Elvish Mystic");
    cast(game, fromGraveyard);
    expect(zone(game, fromGraveyard)).toBe("graveyard");
    spawn(game, "Llanowar Elves", B);
    const fromBattlefield = toHand(game, "Llanowar Elves");
    cast(game, fromBattlefield);
    expect(zone(game, fromBattlefield)).toBe("graveyard");
    const free = toHand(game, "Grizzly Bears");
    cast(game, free);
    expect(zone(game, free)).toBe("battlefield");
  });

  it("asks as it resolves: a namesake gone in response no longer counters", () => {
    const { game } = table();
    spawn(game, "Bazaar of Wonders", B);
    lands(game, "Forest", 2);
    const namesake = toGraveyard(game, "Grizzly Bears", B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.debugMove(namesake, "exile");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("entering exiles every graveyard", () => {
    const { game } = table();
    const buried = toGraveyard(game, "Hill Giant", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    enter(game, "Bazaar of Wonders", B);
    expect(zone(game, buried)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
  });

  it("a namesake on the battlefield must be nontoken", () => {
    const { game } = table();
    spawn(game, "Bazaar of Wonders", B);
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].isToken = true;
    const mine = toHand(game, "Grizzly Bears");
    cast(game, mine);
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Remembrance and Verdant Succession: a card named like the creature that died", () => {
  it("Remembrance finds a namesake and only a namesake, to the hand", () => {
    const { game, a } = table();
    spawn(game, "Remembrance");
    pickModes(a, 0);
    const other = toLibrary(game, "Hill Giant");
    const namesake = toLibrary(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [namesake];
    };
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(offered).toEqual([namesake]);
    expect(hand(game)).toContain(namesake);
    expect(zone(game, other)).toBe("library");
  });

  it("names a copy as it last existed (rule 608.2h): a Clone of Grizzly Bears finds Grizzly Bears", () => {
    const { game, a } = table();
    spawn(game, "Remembrance");
    pickModes(a, 0);
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const namesake = toLibrary(game, "Grizzly Bears");
    const clones = toLibrary(game, "Clone");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    a.chooseCopyFn = () => bears;
    const clone = toHand(game, "Clone");
    cast(game, clone);
    destroy(game, clone);
    settle(game);
    expect(offered).toEqual([namesake]);
    expect(offered).not.toContain(clones);
  });

  it("a creature that died face down had no name for a card to share (rule 201.2a)", () => {
    const { game, a } = table();
    spawn(game, "Remembrance");
    pickModes(a, 0);
    toLibrary(game, "Grizzly Bears");
    let offered: readonly ObjectId[] | undefined;
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    const hidden = spawn(game, "Grizzly Bears");
    game.state.objects[hidden].faceDown = { kind: "manifest" };
    destroy(game, hidden);
    settle(game);
    expect(offered ?? []).toEqual([]);
  });

  it("a token doesn't trigger it, nor another player's creature", () => {
    const { game, a } = table();
    spawn(game, "Remembrance");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    destroy(game, named(game, "Soldier Token", A)[0]);
    settle(game);
    expect(asked).toBe(0);
  });

  it("Verdant Succession: the dead creature's controller searches their own library, onto the battlefield", () => {
    const { game, a, b } = table();
    spawn(game, "Verdant Succession");
    pickModes(b, 0);
    a.chooseModesFn = () => {
      throw new Error("Alice isn't that creature's controller");
    };
    const elsewhere = toLibrary(game, "Grizzly Bears", A);
    const namesake = toLibrary(game, "Grizzly Bears", B);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    destroy(game, spawn(game, "Grizzly Bears", B), A);
    settle(game);
    expect(zone(game, namesake)).toBe("battlefield");
    expect(game.state.objects[namesake].controller).toBe(B);
    expect(zone(game, elsewhere)).toBe("library");
  });

  it("Verdant Succession: a nongreen creature doesn't trigger it", () => {
    const { game, b } = table();
    spawn(game, "Verdant Succession");
    pickModes(b, 0);
    const namesake = toLibrary(game, "Hill Giant", B);
    destroy(game, spawn(game, "Hill Giant", B), A);
    settle(game);
    expect(zone(game, namesake)).toBe("library");
  });
});

describe("Eye of Singularity", () => {
  it("entering destroys each permanent with the same name as another, pairs whoever controls them, not basics", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const lone = spawn(game, "Hill Giant", B);
    const basic = named(game, "Plains", A);
    enter(game, "Eye of Singularity");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, lone)).toBe("battlefield");
    for (const land of basic) expect(zone(game, land)).toBe("battlefield");
  });

  it("the tokens of a stack have the same name as one another (rule 111.1)", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    enter(game, "Eye of Singularity");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });

  it("a face-down permanent has no name to share (rule 201.2a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const hidden = spawn(game, "Grizzly Bears", B);
    game.state.objects[hidden].faceDown = { kind: "manifest" };
    enter(game, "Eye of Singularity");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, hidden)).toBe("battlefield");
  });

  it("a permanent entering destroys the others with its name and survives; they can't regenerate", () => {
    const { game } = table();
    spawn(game, "Eye of Singularity");
    const old = spawn(game, "Grizzly Bears", B);
    game.state.objects[old].regenerationShields = 1;
    const other = spawn(game, "Hill Giant", B);
    const fresh = enter(game, "Grizzly Bears");
    expect(zone(game, old)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("a basic land entering destroys nothing", () => {
    const { game } = table();
    spawn(game, "Eye of Singularity");
    const forest = spawn(game, "Forest");
    const fresh = enter(game, "Forest");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, fresh)).toBe("battlefield");
  });

  it("gone in response: the name as it last existed still destroys, and nothing is spared", () => {
    const { game } = table();
    spawn(game, "Eye of Singularity");
    const old = spawn(game, "Grizzly Bears", B);
    const fresh = enter(game, "Grizzly Bears", A, { settle: false });
    game.debugMove(fresh, "graveyard");
    settle(game);
    expect(zone(game, old)).toBe("graveyard");
  });

  it("back in response is a new object (rule 400.7), not spared", () => {
    const { game } = table();
    spawn(game, "Eye of Singularity");
    const fresh = enter(game, "Grizzly Bears", A, { settle: false });
    game.debugMove(fresh, "exile");
    game.debugMove(fresh, "battlefield");
    settle(game);
    expect(zone(game, fresh)).toBe("graveyard");
  });

  it("two tokens entering together destroy each other: each trigger destroys what the other spared", () => {
    const { game } = table();
    spawn(game, "Eye of Singularity");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });

  it("one token joining a stack destroys the rest and is left", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    spawn(game, "Eye of Singularity");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });
});

describe("the imprinted card's name", () => {
  it("Invader Parasite: 2 damage to an opponent for a land named like the exiled card, not otherwise", () => {
    const { game, a } = table();
    const swamp = spawn(game, "Swamp", B);
    pickTargets(a, swamp);
    enter(game, "Invader Parasite");
    expect(zone(game, swamp)).toBe("exile");
    expect(life(game, B)).toBe(20);
    enter(game, "Swamp", B);
    expect(life(game, B)).toBe(18);
    enter(game, "Forest", B);
    expect(life(game, B)).toBe(18);
    enter(game, "Swamp", A);
    expect(life(game, A)).toBe(20);
  });

  it("Strata Scythe: +1/+1 for each land on the battlefield named like the exiled card, whoever controls it", () => {
    const { game, a } = table();
    const exiled = toLibrary(game, "Island");
    a.chooseFromZoneFn = () => [exiled];
    const scythe = enter(game, "Strata Scythe");
    expect(zone(game, exiled)).toBe("exile");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, scythe, 0, { targets: [ref(bears)] });
    expect(game.state.objects[scythe].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Island");
    spawn(game, "Island", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Strata Scythe: a card exiled by something else isn't its card", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = () => [];
    toExile(game, "Island");
    const scythe = enter(game, "Strata Scythe");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, scythe, 0, { targets: [ref(bears)] });
    spawn(game, "Island");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Extraplanar Lens: lands named like the exiled card give their controller one more, others don't", () => {
    const { game, a } = table();
    const exiled = spawn(game, "Forest");
    pickTargets(a, exiled);
    pickModes(a, 0);
    enter(game, "Extraplanar Lens");
    expect(zone(game, exiled)).toBe("exile");
    activate(game, spawn(game, "Forest"), 0);
    expect(pool(game).G).toBe(2);
    activate(game, spawn(game, "Swamp"), 0);
    expect(pool(game).B).toBe(1);
    const theirs = spawn(game, "Forest", B);
    nextTurn(game);
    activate(game, theirs, 0, { player: B });
    expect(pool(game, B).G).toBe(2);
  });

  it("Extraplanar Lens: declined, there's no exiled card and no bonus mana", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    pickTargets(a, forest);
    pickModes(a);
    enter(game, "Extraplanar Lens");
    expect(zone(game, forest)).toBe("battlefield");
    activate(game, forest, 0);
    expect(pool(game).G).toBe(1);
  });
});
