/**
 * Set walk batch 85, part f (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** Four card types in alice's graveyard — delirium. */
const delirium = (game: Game): void => {
  for (const name of ["Grizzly Bears", "Wastes", "Shock", "Glorious Anthem"]) toGraveyard(game, name);
};

/** Cast one door of a Room from alice's hand. */
const castDoor = (game: Game, name: string, door: 1 | 2): ObjectId => {
  const room = toHand(game, name);
  game.dispatch({ type: "cast-spell", player: A, card: room, face: door, targets: [] });
  settle(game);
  return room;
};

const unlock = (game: Game, room: ObjectId, door: "left" | "right"): void => {
  game.dispatch({ type: "unlock-door", player: A, permanent: room, door });
  settle(game);
};

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Cackling Slasher", () => {
  it("enters with no counter when no creature died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const slasher = toHand(game, "Cackling Slasher");
    cast(game, slasher);
    expect(counters(game, slasher)).toBe(0);
    expect(pt(game, slasher)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, slasher).has("deathtouch")).toBe(true);
  });

  it("enters with a +1/+1 counter once any creature — an opponent's too — died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    destroy(game, spawn(game, "Grizzly Bears", B));
    const slasher = toHand(game, "Cackling Slasher");
    cast(game, slasher);
    expect(counters(game, slasher)).toBe(1);
    expect(pt(game, slasher)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Impossible Inferno", () => {
  it("deals 6 damage to target creature; without delirium, nothing is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const wurm = spawn(game, "Craw Wurm", B);
    const top = toLibrary(game, "Wastes");
    cast(game, toHand(game, "Impossible Inferno"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, top)).toBe("library");
  });

  it("with delirium, exiles the top card, playable through the end of your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    delirium(game);
    const giant = spawn(game, "Hill Giant", B);
    const top = toLibrary(game, "Wastes");
    cast(game, toHand(game, "Impossible Inferno"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, top)).toBe("exile");
    const playable = (): boolean => game.legalActions(A).some((o) => o.kind === "play-land" && o.card === top);
    // Not this turn's main phase only: alice's next turn too.
    nextTurn(game); // bob's
    toStep(game, "precombat-main"); // alice's next
    expect(playable()).toBe(true);
  });
});

describe("Patched Plaything", () => {
  it("cast from your hand: enters with two -1/-1 counters, a 2/1 double striker", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const toy = toHand(game, "Patched Plaything");
    cast(game, toy);
    expect(counters(game, toy, "-1/-1")).toBe(2);
    expect(pt(game, toy)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, toy).has("double-strike")).toBe(true);
  });

  it("put onto the battlefield from a graveyard: no counters, a 4/3", () => {
    const { game } = table();
    const toy = toGraveyard(game, "Patched Plaything");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(toy)]);
    settle(game);
    expect(zone(game, toy)).toBe("battlefield");
    expect(counters(game, toy, "-1/-1")).toBe(0);
    expect(pt(game, toy)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Cult Healer", () => {
  it("gains lifelink until end of turn when an enchantment you control enters, not an opponent's", () => {
    const { game } = table();
    const healer = spawn(game, "Cult Healer");
    enter(game, "Glorious Anthem", B);
    expect(keywords(game, healer).has("lifelink")).toBe(false);
    enter(game, "Glorious Anthem");
    expect(keywords(game, healer).has("lifelink")).toBe(true);
    nextTurn(game);
    expect(keywords(game, healer).has("lifelink")).toBe(false);
  });
});

describe("Erratic Apparition", () => {
  it("gets +1/+1 until end of turn when an enchantment you control enters", () => {
    const { game } = table();
    const apparition = spawn(game, "Erratic Apparition");
    expect(keywords(game, apparition).has("flying")).toBe(true);
    expect(keywords(game, apparition).has("vigilance")).toBe(true);
    enter(game, "Sol Ring");
    expect(pt(game, apparition)).toEqual({ power: 1, toughness: 3 });
    enter(game, "Glorious Anthem");
    // +1/+1 from the trigger, +1/+1 from the anthem.
    expect(pt(game, apparition)).toEqual({ power: 3, toughness: 5 });
    nextTurn(game);
    expect(pt(game, apparition)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Dashing Bloodsucker", () => {
  it("gets +2/+0 and lifelink as a door enters, and again as the Room is fully unlocked", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Dashing Bloodsucker");
    lands(game, "Island", 6);
    pickTargets(a, null);
    const room = castDoor(game, "Bottomless Pool // Locker Room", 1);
    expect(pt(game, vampire)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, vampire).has("lifelink")).toBe(true);
    unlock(game, room, "right");
    expect(pt(game, vampire)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Stalked Researcher", () => {
  it("has defender, but can attack the turn an enchantment you control enters", () => {
    const { game, a } = table();
    const researcher = spawn(game, "Stalked Researcher");
    expect(keywords(game, researcher).has("defender")).toBe(true);
    enter(game, "Glorious Anthem");
    attack(game, a, [researcher]);
    // 3/3 with the anthem's +1/+1.
    expect(life(game, B)).toBe(16);
  });

  it("without the trigger it can't attack", () => {
    const { game, a } = table();
    const researcher = spawn(game, "Stalked Researcher");
    attack(game, a, [researcher]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Infernal Phantom", () => {
  it("gets +2/+0 when an enchantment you control enters; dying, it deals damage equal to its power as it last was", () => {
    const { game, a } = table();
    const phantom = spawn(game, "Infernal Phantom");
    enter(game, "Glorious Anthem");
    expect(pt(game, phantom)).toEqual({ power: 5, toughness: 4 });
    pickTargets(a, B);
    destroy(game, phantom);
    expect(zone(game, phantom)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });
});

describe("Boilerbilges Ripper", () => {
  it("may sacrifice another creature or enchantment; when it does, 2 damage to any target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const anthem = spawn(game, "Glorious Anthem");
    const ring = spawn(game, "Sol Ring");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [anthem];
    };
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Boilerbilges Ripper");
    const [ripper] = named(game, "Boilerbilges Ripper");
    expect([...offered].sort()).toEqual([bears, anthem].sort());
    expect(offered).not.toContain(ring);
    expect(offered).not.toContain(ripper);
    expect(zone(game, anthem)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("declining the sacrifice deals no damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    enter(game, "Boilerbilges Ripper");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Bashful Beastie", () => {
  it("dying, it manifests dread: one of the top two face down, the other to the graveyard", () => {
    const { game, a } = table();
    const beastie = spawn(game, "Bashful Beastie");
    const giant = toLibrary(game, "Hill Giant");
    const wurm = toLibrary(game, "Craw Wurm");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, cards) => {
      offered = cards;
      return [giant];
    };
    destroy(game, beastie);
    expect(zone(game, beastie)).toBe("graveyard");
    expect([...offered].sort()).toEqual([giant, wurm].sort());
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown?.kind).toBe("manifest");
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(graveyard(game)).toContain(wurm);
  });
});

describe("Orphans of the Wheat", () => {
  it("attacking, taps any number of untapped creatures you control and gets +1/+1 for each", () => {
    const { game, a } = table();
    const orphans = spawn(game, "Orphans of the Wheat");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const tired = spawn(game, "Grizzly Bears", A, { tapped: true });
    const seen = pickPermanents(a, bears, giant);
    attack(game, a, [orphans]);
    // Only untapped creatures are offered; the attacking (tapped) Orphans isn't.
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(seen.offered).not.toContain(tired);
    expect(isTapped(game, bears)).toBe(true);
    expect(isTapped(game, giant)).toBe(true);
    expect(pt(game, orphans)).toEqual({ power: 4, toughness: 3 });
    expect(life(game, B)).toBe(16);
  });

  it("tapping none, it stays a 2/1", () => {
    const { game, a } = table();
    const orphans = spawn(game, "Orphans of the Wheat");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    attack(game, a, [orphans]);
    expect(isTapped(game, bears)).toBe(false);
    expect(life(game, B)).toBe(18);
  });
});

describe("Diversion Specialist", () => {
  it("{1}, sacrifice another creature or enchantment: exile the top card, playable this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const specialist = spawn(game, "Diversion Specialist");
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Wastes");
    const act = (sacrifice: ObjectId) =>
      ({ type: "activate-ability", player: A, source: specialist, abilityIndex: 0, targets: [], sacrifice }) as const;
    // Never itself.
    expect(game.canDispatch(act(specialist))).not.toBeNull();
    game.dispatch(act(bears));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, top)).toBe("exile");
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === top)).toBe(true);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === top)).toBe(false);
  });
});

describe("Rootwise Survivor", () => {
  it("survival: tapped at your second main phase, a land you control becomes a 3/3 Elemental creature with haste until your next turn", () => {
    const { game, a } = table();
    const survivor = spawn(game, "Rootwise Survivor");
    const forest = spawn(game, "Forest");
    const seen = watchTargets(a, () => [forest]);
    attack(game, a, [survivor]);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(counters(game, forest)).toBe(3);
    expect(types(game, forest)).toContain("creature");
    expect(types(game, forest)).toContain("land");
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, forest).has("haste")).toBe(true);
    nextTurn(game); // bob's
    expect(keywords(game, forest).has("haste")).toBe(true);
    toStep(game, "precombat-main"); // alice's next: haste is gone, the creature stays
    expect(keywords(game, forest).has("haste")).toBe(false);
    expect(types(game, forest)).toContain("creature");
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
  });

  it("untapped at your second main phase, it doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Rootwise Survivor");
    const forest = spawn(game, "Forest");
    const seen = watchTargets(a, () => [forest]);
    toStep(game, "postcombat-main");
    settle(game);
    expect(seen.asked).toBe(0);
    expect(types(game, forest)).not.toContain("creature");
  });
});

describe("Hand That Feeds", () => {
  it("attacking with delirium, it gets +2/+0 and menace", () => {
    const { game, a } = table();
    delirium(game);
    const mutant = spawn(game, "Hand That Feeds");
    attack(game, a, [mutant]);
    expect(pt(game, mutant)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, mutant).has("menace")).toBe(true);
    expect(life(game, B)).toBe(16);
  });

  it("attacking without delirium, nothing", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Shock");
    const mutant = spawn(game, "Hand That Feeds");
    attack(game, a, [mutant]);
    expect(keywords(game, mutant).has("menace")).toBe(false);
    expect(life(game, B)).toBe(18);
  });
});

describe("Resurrected Cultist", () => {
  it("with delirium (itself counting), returns from the graveyard with a finality counter; dying again, it's exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const cultist = toGraveyard(game, "Resurrected Cultist");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Glorious Anthem");
    activate(game, cultist, 0);
    expect(zone(game, cultist)).toBe("battlefield");
    expect(counters(game, cultist, "finality")).toBe(1);
    destroy(game, cultist);
    expect(zone(game, cultist)).toBe("exile");
  });

  it("can't be activated with only three card types in the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const cultist = toGraveyard(game, "Resurrected Cultist");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Shock");
    expect(() => activate(game, cultist, 0)).toThrow();
  });
});

describe("Anthropede", () => {
  it("paying {2}: destroys target Room", () => {
    const { game, a } = table();
    const forests = lands(game, "Forest", 2);
    const room = spawn(game, "Bottomless Pool // Locker Room", B);
    const mine = spawn(game, "Bottomless Pool // Locker Room");
    const bears = spawn(game, "Grizzly Bears", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    const before = hand(game).length;
    pickModes(a, 1);
    const seen = watchTargets(a, () => [room]);
    enter(game, "Anthropede");
    // Any Room, yours too; no other enchantment or creature.
    expect([...seen.offered[0]].sort()).toEqual([room, mine].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(anthem);
    expect(zone(game, room)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(forests.every((f) => isTapped(game, f))).toBe(true);
    expect(hand(game).length).toBe(before);
  });

  it("discarding a card instead: destroys target Room", () => {
    const { game, a } = table();
    const room = spawn(game, "Bottomless Pool // Locker Room", B);
    const before = hand(game).length;
    pickModes(a, 0);
    pickTargets(a, room);
    enter(game, "Anthropede");
    expect(zone(game, room)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });

  it("declining does nothing", () => {
    const { game, a } = table();
    const room = spawn(game, "Bottomless Pool // Locker Room", B);
    const before = hand(game).length;
    pickModes(a);
    enter(game, "Anthropede");
    expect(zone(game, room)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});
