/**
 * Set walk batch 87, part c (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
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
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const SPAWN = "Eldrazi Spawn Token";
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const energy = (game: Game, player = A): number => game.state.players[player].energy;
const makeToken = (game: Game, token: string, player = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token, count: 1 });
  settle(game);
};

describe("Propagator Drone", () => {
  it("creature tokens you control have evolve, and see the Drone itself enter", () => {
    const { game } = table();
    makeToken(game, SPAWN);
    const token = named(game, SPAWN)[0];
    enter(game, "Propagator Drone");
    // A 2/2 entered beside a 0/1 token: it evolves.
    expect(counters(game, token)).toBe(1);
    // A 1/1 is neither bigger than the 1/2 token's power nor its toughness.
    enter(game, "Llanowar Elves");
    expect(counters(game, token)).toBe(1);
    enter(game, "Centaur Courser");
    expect(counters(game, token)).toBe(2);
  });

  it("nontoken creatures don't get evolve", () => {
    const { game } = table();
    spawn(game, "Propagator Drone");
    const bears = spawn(game, "Llanowar Elves");
    enter(game, "Centaur Courser");
    expect(counters(game, bears)).toBe(0);
  });

  it("{3}{G}: creates an Eldrazi Spawn", () => {
    const { game } = table();
    const drone = spawn(game, "Propagator Drone");
    lands(game, "Forest", 4);
    activate(game, drone);
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
  });
});

describe("The Hunger Tide Rises", () => {
  it("makes an Insect on I, II and III, then sacrifices any number of creatures to find one with mana value up to that many", () => {
    const { game, a } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const saga = enter(game, "The Hunger Tide Rises");
    expect(tokensNamed(game, "Insect Token (Black-Green)", A)).toBe(1);
    toStep(game, "precombat-main");
    settle(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Insect Token (Black-Green)", A)).toBe(3);
    // Chapter IV: sacrifice the three Bears (not the Insects). The library
    // cards go in under this turn's draw.
    toStep(game, "upkeep");
    const courser = toLibrary(game, "Centaur Courser");
    const angel = toLibrary(game, "Serra Angel");
    toLibrary(game, "Wastes");
    a.choosePermanentsFn = () => bears;
    pickModes(a, 1); // search the library only
    const offered: ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(...eligible);
      return eligible.filter((id) => id === courser);
    };
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, angel)).toBe("library");
    for (const id of bears) expect(zone(game, id)).toBe("graveyard");
    expect(offered).toContain(courser);
    expect(offered).not.toContain(angel);
    expect(zone(game, courser)).toBe("battlefield");
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("with fewer creatures sacrificed, a bigger creature isn't offered; the graveyard can be searched", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const saga = spawn(game, "The Hunger Tide Rises");
    game.state.objects[saga].counters.lore = 3;
    const courser = toGraveyard(game, "Centaur Courser");
    const bear = toGraveyard(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [one];
    pickModes(a, 2); // search the graveyard only
    const offered: ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(...eligible);
      return [];
    };
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, one)).toBe("graveyard");
    // One sacrificed: only mana value 1 or less — neither a 2 nor a 3.
    expect(offered).not.toContain(courser);
    expect(offered).not.toContain(bear);
  });
});

describe("Territory Culler", () => {
  it("landfall: a creature card on top may go to your hand", () => {
    const { game, a } = table();
    spawn(game, "Territory Culler");
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    enter(game, "Forest");
    expect(zone(game, bears)).toBe("hand");
  });

  it("a card not taken may be put into your graveyard instead; a noncreature can't be taken", () => {
    const { game, a } = table();
    spawn(game, "Territory Culler");
    const wastes = toLibrary(game, "Wastes");
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      return eligible;
    };
    enter(game, "Forest");
    // The first pick (into the hand) offers nothing: it's no creature card.
    expect(asked.some((e) => e.includes(wastes))).toBe(true);
    expect(zone(game, wastes)).toBe("graveyard");
  });
});

describe("Eldrazi Repurposer", () => {
  it("makes a Spawn when cast and another when it dies", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const card = toHand(game, "Eldrazi Repurposer");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
    destroy(game, card);
    expect(tokensNamed(game, SPAWN, A)).toBe(2);
  });

  it("the cast trigger resolves first, still making a Spawn if the spell is countered (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const card = toHand(game, "Eldrazi Repurposer");
    cast(game, card, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(card)]);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
  });
});

describe("Quest for the Necropolis", () => {
  it("gets a quest counter per land, and each takes {1} off reanimating any graveyard's creature", () => {
    const { game } = table();
    const quest = spawn(game, "Quest for the Necropolis");
    const theirs = toGraveyard(game, "Serra Angel", B);
    lands(game, "Swamp", 2);
    // {5}{B} with two lands: not yet.
    expect(() => activate(game, quest, 0, { targets: [ref(theirs)] })).toThrow();
    enter(game, "Swamp");
    enter(game, "Swamp");
    expect(counters(game, quest, "quest")).toBe(2);
    // Activate only as a sorcery: back to a main phase.
    toStep(game, "postcombat-main");
    // Four lands pay {5}{B} less {2}.
    activate(game, quest, 0, { targets: [ref(theirs)] });
    expect(zone(game, quest)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
  });
});

describe("Unfathomable Truths", () => {
  it("draws three and makes a Spawn", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toHand(game, "Unfathomable Truths");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
  });
});

describe("Eldrazi Ravager", () => {
  it("sacrifice two Eldrazi: returns from your graveyard to your hand", () => {
    const { game } = table();
    const ravager = toGraveyard(game, "Eldrazi Ravager");
    const one = spawn(game, "Territory Culler");
    const two = spawn(game, "Eldrazi Linebreaker");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, ravager);
    expect(zone(game, ravager)).toBe("hand");
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("isn't activatable with one Eldrazi", () => {
    const { game } = table();
    const ravager = toGraveyard(game, "Eldrazi Ravager");
    spawn(game, "Territory Culler");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, ravager)).toThrow();
  });

  it("annihilator 1: the defending player sacrifices a permanent", () => {
    const { game, a } = table();
    const ravager = spawn(game, "Eldrazi Ravager");
    const theirs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [ravager]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });
});

describe("Skittering Precursor", () => {
  it("a sacrificed nontoken permanent — a creature or a land — makes a Spawn; a token doesn't", () => {
    const { game } = table();
    spawn(game, "Skittering Precursor");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
    const forest = spawn(game, "Forest");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(forest)]);
    settle(game);
    expect(tokensNamed(game, SPAWN, A)).toBe(2);
    // A Spawn sacrificed for mana is a token.
    activate(game, named(game, SPAWN)[0]);
    expect(tokensNamed(game, SPAWN, A)).toBe(1);
  });

  it("an opponent's sacrifice doesn't count", () => {
    const { game } = table();
    spawn(game, "Skittering Precursor");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "sacrifice-target", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(tokensNamed(game, SPAWN, A)).toBe(0);
  });
});

describe("Eldrazi Linebreaker", () => {
  it("at the beginning of combat, a creature you control gets haste and +X/+0 for each Eldrazi you control", () => {
    const { game, a } = table();
    spawn(game, "Eldrazi Linebreaker");
    spawn(game, "Territory Culler");
    makeToken(game, SPAWN);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Temperamental Oozewagg", () => {
  it("adapts once, and modified creatures you control have trample", () => {
    const { game } = table();
    const ooze = spawn(game, "Temperamental Oozewagg");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 6);
    expect(keywords(game, ooze).has("trample")).toBe(false);
    activate(game, ooze);
    expect(counters(game, ooze)).toBe(2);
    expect(keywords(game, ooze).has("trample")).toBe(true);
    activate(game, ooze);
    expect(counters(game, ooze)).toBe(2);
    expect(keywords(game, bears).has("trample")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Serum Visionary", () => {
  it("enters: draws a card, then scries 2", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Serum Visionary");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(scried).toBe(2);
  });
});

describe("Horrific Assault", () => {
  it("your creature deals damage equal to its power; with no Eldrazi, no life", () => {
    const { game } = table();
    spawn(game, "Forest");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Horrific Assault"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    // One-sided: the target deals no damage back.
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(life(game, A)).toBe(20);
  });

  it("with an Eldrazi you gain 3 life — even when your creature is gone and no damage is dealt (the ruling)", () => {
    const { game } = table();
    spawn(game, "Forest");
    spawn(game, "Territory Culler");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Horrific Assault"), { targets: [ref(mine), ref(theirs)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(mine)]);
    settle(game);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].damageMarked).toBe(0);
    expect(life(game, A)).toBe(23);
  });
});

describe("Genku, Future Shaper", () => {
  it("each nontoken permanent of yours leaving makes a token of a mode not chosen this turn; a fourth makes none", () => {
    const { game } = table();
    spawn(game, "Genku, Future Shaper");
    for (let i = 0; i < 4; i += 1) spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { name: "Grizzly Bears" } });
    settle(game);
    expect(tokensNamed(game, "Fox Token", A)).toBe(1);
    expect(tokensNamed(game, "Moonfolk Token", A)).toBe(1);
    expect(tokensNamed(game, "Rat Token (Genku, Future Shaper)", A)).toBe(1);
    const [fox] = named(game, "Fox Token");
    expect(pt(game, fox)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, fox).has("vigilance")).toBe(true);
  });

  it("a token leaving, or an opponent's permanent, doesn't trigger it; the modes come back next turn", () => {
    const { game } = table();
    spawn(game, "Genku, Future Shaper");
    makeToken(game, SPAWN);
    activate(game, named(game, SPAWN)[0]);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Fox Token", A)).toBe(0);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Fox Token", A)).toBe(1);
    toStep(game, "precombat-main");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Fox Token", A)).toBe(2);
  });

  it("{3}{W}{U}: a +1/+1 counter on each creature you control", () => {
    const { game } = table();
    const genku = spawn(game, "Genku, Future Shaper");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    spawn(game, "Island");
    activate(game, genku);
    expect(counters(game, genku)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Riddle Gate Gargoyle", () => {
  it("enters with three energy; attacking, two of it give a creature you control lifelink", () => {
    const { game, a } = table();
    const gargoyle = enter(game, "Riddle Gate Gargoyle");
    expect(energy(game)).toBe(3);
    pickModes(a, 0);
    pickTargets(a, gargoyle);
    attack(game, a, [gargoyle]);
    expect(energy(game)).toBe(1);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("isn't offered without {E}{E}", () => {
    const { game, a } = table();
    const gargoyle = spawn(game, "Riddle Gate Gargoyle");
    game.state.players[A].energy = 1;
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    attack(game, a, [gargoyle]);
    expect(asked).toBe(0);
    expect(energy(game)).toBe(1);
    expect(life(game, A)).toBe(20);
  });
});

describe("Retrofitted Transmogrant", () => {
  it("returns from your graveyard tapped with two +1/+1 counters", () => {
    const { game } = table();
    const card = toGraveyard(game, "Retrofitted Transmogrant");
    lands(game, "Swamp", 4);
    activate(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(isTapped(game, card)).toBe(true);
    expect(pt(game, card)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Ajani Fells the Godsire", () => {
  it("I exiles an opponent's creature with power 3 or greater; II makes a Cat Warrior and puts a vigilance counter on a creature you choose; III grants double strike", () => {
    const { game, a } = table();
    const big = spawn(game, "Centaur Courser", B);
    const small = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [big]);
    enter(game, "Ajani Fells the Godsire");
    expect(seen.offered[0]).toContain(big);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(small);
    expect(zone(game, big)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    const chose = pickPermanents(a, mine);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Cat Warrior Token (Ajani Fells the Godsire)", A)).toBe(1);
    const [cat] = named(game, "Cat Warrior Token (Ajani Fells the Godsire)");
    expect(chose.offered).toContain(cat);
    expect(counters(game, mine, "vigilance")).toBe(1);
    expect(keywords(game, mine).has("vigilance")).toBe(true);
    pickTargets(a, cat);
    toStep(game, "precombat-main");
    settle(game);
    expect(keywords(game, cat).has("double-strike")).toBe(true);
  });
});
