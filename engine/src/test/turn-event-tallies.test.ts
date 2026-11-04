import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

// `TurnHistory`'s lists and counts, read by the conditions `turn-history` and
// `turn-stat` and the amount `{ turnHistory }`: creatures declared as attackers
// as they were declared, permanents turned face up, regenerations, surveils,
// searches of one's own library, cards put into exile.

const toPostcombat = (game: Game): void => {
  game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s) && s.priority.holder === A);
};
/** Through the end step's triggers, to the cleanup or past it. */
const pastEndStep = (game: Game): void => {
  const turn = game.state.turn.number;
  game.advanceUntil((s) => s.turn.number > turn);
};
/** A Soldier token alice created (a spawned "token" card isn't one). */
const realToken = (game: Game): ObjectId => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
  settle(game);
  return Object.values(game.state.objects).find((o) => o.isToken === true && o.zone === "battlefield")!.id;
};
const tokensNamed = (game: Game, name: string): number =>
  Object.values(game.state.objects)
    .filter((o) => o.cardName === name && o.zone === "battlefield")
    .reduce((n, o) => n + (o.stackCount ?? 1), 0);

describe("attacked with: a list of creatures as they were declared", () => {
  const attackWith = (t: ReturnType<typeof table>, attackers: readonly ObjectId[]): void => {
    t.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    t.game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.objects[attackers[0]].attackedThisTurn === true && quiet(s) && s.priority.holder === A,
    );
  };

  it("Deepway Navigator: two Merfolk and a Bear aren't three Merfolk", () => {
    const t = table();
    const navigator = spawn(t.game, "Deepway Navigator", A, { sick: true });
    attackWith(t, [spawn(t.game, "Coral Merfolk"), spawn(t.game, "Coral Merfolk"), spawn(t.game, "Grizzly Bears")]);
    expect(pt(t.game, navigator)).toEqual({ power: 2, toughness: 2 });
    expect(t.game.state.players[A].turnHistory?.attackers?.length).toBe(3);
  });

  it("Deepway Navigator's +1/+0 stays though the Merfolk have gone, and ends with the turn", () => {
    const t = table();
    const { game } = t;
    const merfolk = [spawn(game, "Coral Merfolk"), spawn(game, "Coral Merfolk"), spawn(game, "Coral Merfolk")];
    const navigator = spawn(game, "Deepway Navigator", A, { sick: true });
    attackWith(t, merfolk);
    expect(pt(game, navigator)).toEqual({ power: 3, toughness: 2 });
    for (const id of merfolk) game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
    settle(game);
    expect(zone(game, merfolk[0])).toBe("graveyard");
    expect(pt(game, navigator)).toEqual({ power: 3, toughness: 2 });
    nextTurn(game);
    expect(pt(game, navigator)).toEqual({ power: 2, toughness: 2 });
  });

  it("asks what they were as they were declared: Bears made Merfolk afterwards don't count", () => {
    const t = table();
    const { game } = t;
    const navigator = spawn(game, "Deepway Navigator", A, { sick: true });
    attackWith(t, [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")]);
    spawn(game, "Maskwood Nexus");
    expect(pt(game, navigator)).toEqual({ power: 2, toughness: 2 });
  });

  it("Deepway Navigator untaps each other Merfolk as it enters", () => {
    const { game } = table();
    const merfolk = spawn(game, "Coral Merfolk", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Deepway Navigator"));
    expect(game.state.objects[merfolk].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Avengers Assemble!: a Hero that attacked draws on each end step, a Hero gets +2/+2", () => {
    const t = table();
    const { game } = t;
    const hero = spawn(game, "Spider-Man, Brooklyn Visionary");
    spawn(game, "Avengers Assemble!");
    const printed = game.registry.get("Spider-Man, Brooklyn Visionary");
    expect(pt(game, hero).power).toBe((printed.power as number) + 2);
    attackWith(t, [hero]);
    const before = hand(game).length;
    pastEndStep(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Avengers Assemble!: a Hero that entered, or nothing at all", () => {
    const { game } = table();
    spawn(game, "Avengers Assemble!");
    const before = hand(game).length;
    pastEndStep(game);
    expect(hand(game).length).toBe(before);
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A && quiet(s));
    enter(game, "Spider-Man, Brooklyn Visionary");
    pastEndStep(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Minas Tirith: asks for two attackers, whatever kind", () => {
    const t = table();
    const { game } = t;
    const tirith = spawn(game, "Minas Tirith");
    game.state.objects[tirith].tapped = false;
    lands(game, "Plains", 2);
    const canDraw = (): boolean =>
      game.canDispatch({ type: "activate-ability", player: A, source: tirith, abilityIndex: 1, targets: [] }) === null;
    expect(canDraw()).toBe(false);
    attackWith(t, [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")]);
    expect(canDraw()).toBe(true);
  });

  it("Minas Tirith enters tapped without a legendary creature, and untapped with one", () => {
    const { game } = table();
    const first = toHand(game, "Minas Tirith");
    game.dispatch({ type: "play-land", player: A, card: first });
    settle(game);
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Isamaru, Hound of Konda");
    const second = toHand(game, "Minas Tirith");
    game.dispatch({ type: "play-land", player: A, card: second });
    settle(game);
    expect(game.state.objects[second].tapped).toBe(false);
  });

  it("Thaumaton Torpedo: {6} until a Spacecraft has attacked; a Bear won't do", () => {
    const t = table();
    const { game } = t;
    lands(game, "Wastes", 3);
    const torpedo = spawn(game, "Thaumaton Torpedo");
    const victim = spawn(game, "Hill Giant", B);
    const canFire = (): boolean =>
      game.canDispatch({ type: "activate-ability", player: A, source: torpedo, abilityIndex: 0, targets: [ref(victim)] }) === null;
    expect(canFire()).toBe(false);
    const bears = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toPostcombat(game);
    expect(canFire()).toBe(false);
  });

  it("Thaumaton Torpedo: {3} once a Spacecraft has attacked", () => {
    const t = table();
    const { game } = t;
    lands(game, "Wastes", 3);
    const torpedo = spawn(game, "Thaumaton Torpedo");
    const victim = spawn(game, "Hill Giant", B);
    const ship = spawn(game, "Galvanizing Sawship");
    game.state.objects[ship].counters.charge = 3;
    attackWith(t, [ship]);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: torpedo, abilityIndex: 0, targets: [ref(victim)] }),
    ).toBeNull();
    activate(game, torpedo, 0, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, torpedo)).toBe("graveyard");
  });

  it("Neyali: a token attacking has double strike, and the card is playable in a turn a token attacked", () => {
    const t = table({ deck: "Mountain" });
    const { game } = t;
    spawn(game, "Neyali, Suns' Vanguard");
    const token = realToken(game);
    game.state.objects[token].summoningSick = false;
    attackWith(t, [token]);
    expect(keywords(game, token).has("double-strike")).toBe(true);
    expect(game.state.players[A].turnHistory?.attackers?.[0].asDeclared?.isToken).toBe(true);
    const exiled = game.state.zones.shared.exile;
    expect(exiled).toHaveLength(1);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s) && s.priority.holder === A);
    const canPlay = (): boolean => game.legalActions(A).some((o) => o.kind === "play-land" && o.card === exiled[0]);
    expect(canPlay()).toBe(true);
    // Bob's turn and a turn of hers with no token attacking: not then.
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(canPlay()).toBe(false);
  });

  it("Neyali: a nontoken attacking triggers nothing and allows nothing", () => {
    const t = table();
    spawn(t.game, "Neyali, Suns' Vanguard");
    attackWith(t, [spawn(t.game, "Grizzly Bears")]);
    expect(t.game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Hobgoblin Bandit Lord: permanents that entered, as they entered", () => {
  it("counts Goblins that entered under you, wherever they have gone", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const lord = spawn(game, "Hobgoblin Bandit Lord");
    const goblin = enter(game, "Goblin Piker");
    enter(game, "Goblin Piker");
    enter(game, "Grizzly Bears");
    enter(game, "Goblin Piker", B);
    // Its own +1/+1 to other Goblins.
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 2 });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(goblin)]);
    settle(game);
    activate(game, lord, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("turned face up, and entered face down", () => {
  const faceDown = (game: Game, name: string, player = A): ObjectId => {
    const id = spawn(game, name, player);
    game.state.objects[id].faceDown = { kind: "morph" };
    return id;
  };

  it("Oblivious Bookworm discards when neither happened", () => {
    const { game, a } = table({ deck: "Plains" });
    spawn(game, "Oblivious Bookworm");
    const keep = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [keep];
    pastEndStep(game);
    expect(graveyard(game)).toContain(keep);
  });

  it("Oblivious Bookworm keeps the card once a permanent has been turned face up", () => {
    const { game, a } = table({ deck: "Plains" });
    spawn(game, "Oblivious Bookworm");
    const keep = toHand(game, "Grizzly Bears");
    const hidden = faceDown(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(hidden)]);
    settle(game);
    expect(game.state.players[A].turnHistory?.["turned-face-up"]).toHaveLength(1);
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [keep];
    pastEndStep(game);
    expect(graveyard(game)).not.toContain(keep);
  });

  it("Oblivious Bookworm keeps the card once a permanent has entered face down", () => {
    const { game, a } = table({ deck: "Plains" });
    spawn(game, "Oblivious Bookworm");
    const keep = toHand(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "manifest", who: "you" }, []);
    settle(game);
    expect(game.state.players[A].turnHistory?.entered?.at(-1)?.asEntered?.faceDown).toBe(true);
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [keep];
    pastEndStep(game);
    expect(graveyard(game)).not.toContain(keep);
  });

  it("Kaust draws for a creature turned face up this turn, and not for one that wasn't", () => {
    const t = table();
    const { game } = t;
    const kaust = spawn(game, "Kaust, Eyes of the Glade");
    const hidden = faceDown(game, "Grizzly Bears");
    const open = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [hidden, open].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.objects[hidden].attackedThisTurn === true && quiet(s) && s.priority.holder === A,
    );
    activate(game, kaust, 0, { targets: [ref(hidden)] });
    expect(game.state.objects[hidden].faceDown).toBeUndefined();
    expect(game.state.objects[hidden].turnedFaceUpOnTurn).toBe(game.state.turn.number);
    const before = hand(game).length;
    toPostcombat(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Kaust's target must be face down and attacking", () => {
    const { game } = table();
    const kaust = spawn(game, "Kaust, Eyes of the Glade");
    const hidden = faceDown(game, "Grizzly Bears");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: kaust, abilityIndex: 0, targets: [ref(hidden)] }),
    ).not.toBeNull();
  });
});

describe("the rest of the turn's tallies", () => {
  it("Suspicious Detonation costs {3} less once you've sacrificed an artifact, and can't be countered", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const card = toHand(game, "Suspicious Detonation");
    const victim = spawn(game, "Grizzly Bears", B);
    const canCast = (): boolean =>
      game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(victim)] }) === null;
    expect(canCast()).toBe(false);
    // A creature sacrificed isn't an artifact.
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(bear)]);
    settle(game);
    expect(canCast()).toBe(false);
    const relic = spawn(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(relic)]);
    settle(game);
    expect(canCast()).toBe(true);
    cast(game, card, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(game.registry.get("Suspicious Detonation").cantBeCountered).toBe(true);
  });

  it("Darkblade Agent has deathtouch and the draw only once you've surveilled, a scry not counting", () => {
    const { game, a } = table();
    const agent = spawn(game, "Darkblade Agent");
    expect(keywords(game, agent).has("deathtouch")).toBe(false);
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    expect(keywords(game, agent).has("deathtouch")).toBe(false);
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 }, []);
    settle(game);
    expect(keywords(game, agent).has("deathtouch")).toBe(true);
    a.declareAttackersFn = () => [{ attacker: agent, defender: B }];
    const before = hand(game).length;
    toPostcombat(game);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(18);
  });

  it("Archive Trap is free once an opponent has searched their own library, not yours", () => {
    const { game } = table();
    const trap = toHand(game, "Archive Trap");
    const free = (): boolean => game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === trap && o.free === true);
    expect(free()).toBe(false);
    const search = { kind: "search-library", filter: { type: "land" }, destination: "hand", min: 0, max: 1 } as const;
    game.debugApplyEffect(A, search, []);
    settle(game);
    expect(free()).toBe(false);
    game.debugApplyEffect(B, search, []);
    settle(game);
    expect(game.state.players[B].turnHistory?.ownLibrarySearched).toBe(1);
    expect(free()).toBe(true);
    cast(game, trap, { targets: [ref(B)], free: true });
    expect(graveyard(game, B).length).toBeGreaterThanOrEqual(13);
  });

  it("Ennis grows if a card went to exile this turn, by anyone's doing", () => {
    const { game } = table();
    const ennis = spawn(game, "Ennis, Debate Moderator");
    const stranger = spawn(game, "Grizzly Bears", B);
    pastEndStep(game);
    expect(counters(game, ennis)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 3 && quiet(s) && s.priority.holder === A);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(stranger)]);
    settle(game);
    pastEndStep(game);
    expect(counters(game, ennis)).toBe(1);
  });

  it("Ennis blinks another creature until the end step, and that counts", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(bears)];
    const ennis = toHand(game, "Ennis, Debate Moderator");
    cast(game, ennis);
    expect(zone(game, bears)).toBe("exile");
    pastEndStep(game);
    expect(counters(game, ennis)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a token exiled isn't a card put into exile", () => {
    const { game } = table();
    const token = realToken(game);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(token)]);
    settle(game);
    expect(game.state.players[A].turnHistory?.cardsPutIntoExile ?? 0).toBe(0);
  });

  it("Ellyn Harbreeze looks at as many cards as tokens you created this turn, a stack counted whole", () => {
    const { game, a } = table({ deck: "Plains" });
    const ellyn = spawn(game, "Ellyn Harbreeze, Busybody");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    settle(game);
    let looked = 0;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      looked = eligible.length;
      return eligible.slice(0, min);
    };
    const before = hand(game).length;
    activate(game, ellyn, 0);
    settle(game);
    expect(looked).toBe(3);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Spiny Starfish makes a token per time it regenerated, on any end step", () => {
    const { game } = table({ deck: "Island" });
    lands(game, "Island", 2);
    const starfish = spawn(game, "Spiny Starfish");
    for (let i = 0; i < 2; i += 1) {
      activate(game, starfish, 0);
      game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(starfish)]);
      settle(game);
      expect(zone(game, starfish)).toBe("battlefield");
    }
    expect(game.state.players[A].turnHistory?.regenerated).toHaveLength(2);
    pastEndStep(game);
    expect(tokensNamed(game, "0/1 Blue Starfish Token")).toBe(2);
    // None at the next end step: it hasn't regenerated that turn.
    pastEndStep(game);
    expect(tokensNamed(game, "0/1 Blue Starfish Token")).toBe(2);
  });
});
