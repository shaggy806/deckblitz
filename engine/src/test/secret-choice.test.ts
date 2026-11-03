/**
 * A choice made secretly (the need-keys `decision:secret-choice` key): a player
 * as a permanent enters or as an ability resolves, or a word from a short list,
 * kept on the permanent as `GameObject.secretChoice`, out of every other seat's
 * view and the log until a `revealChosen` cost shows it. Only the chooser can
 * pay that cost. Stalking Leonin, Guardian Archon, Emissary of Grudges, A Killer
 * Among Us; Goblin Game for the secret number `vote` already keeps.
 */
import { describe, expect, it } from "vitest";

import type { GameEvent } from "../events.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { SPECTATOR } from "../view.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  counters,
  keywords,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const answering = (name: string) => (_view: unknown, _source: unknown, options: readonly string[]) => {
  if (!options.includes(name)) throw new Error(`${name} isn't among ${options.join(", ")}`);
  return name;
};

const eventsOf = <T extends GameEvent["type"]>(game: Game, type: T): readonly Extract<GameEvent, { type: T }>[] =>
  game.viewFor(A).events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);

/** Cast `name` for Alice from `land`s, and let it and its triggers finish. */
function play(game: Game, name: string, land: string, n: number): ObjectId {
  lands(game, land, n);
  const card = toHand(game, name);
  cast(game, card);
  return card;
}

/** The holder passes until `player` has priority, the stack as it is. */
function passTo(game: Game, player: PlayerId): void {
  for (let i = 0; i < 8 && game.state.priority.holder !== player; i += 1) {
    const holder = game.state.priority.holder;
    if (holder === null) break;
    game.dispatch({ type: "pass-priority", player: holder });
  }
}

/** Everyone passes until the top of the stack has resolved or a decision is up. */
function resolveTop(game: Game): void {
  const depth = game.state.zones.shared.stack.length;
  for (let i = 0; i < 12; i += 1) {
    if (game.state.awaiting !== null || game.state.zones.shared.stack.length < depth) return;
    const holder = game.state.priority.holder;
    if (holder === null) return;
    game.dispatch({ type: "pass-priority", player: holder });
  }
}

describe("a secret choice stays hidden", () => {
  it("as a permanent enters: only the chooser's view has it, and no event names it", () => {
    const { game, a } = table({ players: 4 });
    a.chooseCreatureTypeFn = answering(C);
    const archon = play(game, "Guardian Archon", "Plains", 6);
    expect(game.state.objects[archon].chosenPlayer).toBe(C);
    expect(game.state.objects[archon].secretChoice).toEqual({ by: A });
    const mine = game.viewFor(A).objects[archon];
    expect(mine?.chosenPlayer).toBe(C);
    expect(mine?.secretChoice).toBe("yours");
    for (const seat of [B, C, D, SPECTATOR]) {
      const theirs = game.viewFor(seat).objects[archon];
      expect(theirs?.chosenPlayer).toBeUndefined();
      expect(theirs?.secretChoice).toBe("hidden");
    }
    expect(eventsOf(game, "secret-choice-made")).toMatchObject([{ object: archon, player: A }]);
    expect(eventsOf(game, "creature-type-chosen")).toEqual([]);
  });

  it("is asked of the chooser, among the opponents", () => {
    const { game, a } = table({ players: 3 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      offered = options;
      return options[1];
    };
    play(game, "Guardian Archon", "Plains", 6);
    expect(offered).toEqual([B, C]);
  });

  it("as an ability resolves (Stalking Leonin): hidden the same way", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = answering(C);
    const leonin = play(game, "Stalking Leonin", "Plains", 3);
    expect(game.state.objects[leonin].chosenPlayer).toBe(C);
    expect(game.viewFor(A).objects[leonin]?.chosenPlayer).toBe(C);
    expect(game.viewFor(B).objects[leonin]?.chosenPlayer).toBeUndefined();
    expect(game.viewFor(B).objects[leonin]?.secretChoice).toBe("hidden");
    expect(eventsOf(game, "secret-choice-made")).toMatchObject([{ object: leonin, player: A }]);
    expect(eventsOf(game, "modes-chosen")).toEqual([]);
    expect(eventsOf(game, "creature-type-chosen")).toEqual([]);
  });

  it("while it's being asked, nothing of the answer exists to see", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 3);
    a.chooseCreatureTypeFn = () => {
      // Bob's view at the moment of asking: a question, its options, no answer.
      expect(game.viewFor(B).awaiting?.kind).toBe("choose-creature-type");
      return C;
    };
    cast(game, toHand(game, "Stalking Leonin"));
    expect(game.state.objects[game.state.zones.shared.battlefield.at(-1) as ObjectId].chosenPlayer).toBe(C);
  });

  it("a word from a short list (A Killer Among Us): hidden from the others' `chosen`", () => {
    const { game, a } = table({ players: 2 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      offered = options;
      return "Merfolk";
    };
    const killer = play(game, "A Killer Among Us", "Forest", 5);
    expect(offered).toEqual(["Human", "Merfolk", "Goblin"]);
    expect(game.state.objects[killer].chosenCreatureType).toBe("Merfolk");
    expect(game.viewFor(A).objects[killer]?.chosen).toBe("Merfolk");
    expect(game.viewFor(A).objects[killer]?.secretChoice).toBe("yours");
    expect(game.viewFor(B).objects[killer]?.chosen).toBeUndefined();
    expect(game.viewFor(B).objects[killer]?.secretChoice).toBe("hidden");
    expect(eventsOf(game, "creature-type-chosen")).toEqual([]);
  });

  it("with one opponent nobody is asked, but there's still a choice to reveal", () => {
    const { game, a } = table({ players: 2 });
    a.chooseCreatureTypeFn = () => {
      throw new Error("not asked: there's one opponent");
    };
    const archon = play(game, "Guardian Archon", "Plains", 6);
    const leonin = play(game, "Stalking Leonin", "Plains", 3);
    for (const id of [archon, leonin]) {
      expect(game.state.objects[id].chosenPlayer).toBe(B);
      expect(game.state.objects[id].secretChoice).toEqual({ by: A });
    }
  });

  it("a Clone entering as it chooses secretly for itself (rule 614.12)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = answering(C);
    const archon = play(game, "Guardian Archon", "Plains", 6);
    a.chooseCreatureTypeFn = answering(B);
    a.chooseCopyFn = () => archon;
    const clone = play(game, "Clone", "Island", 4);
    expect(game.state.objects[archon].chosenPlayer).toBe(C);
    expect(game.state.objects[clone].chosenPlayer).toBe(B);
    expect(game.state.objects[clone].secretChoice).toEqual({ by: A });
    expect(game.viewFor(C).objects[clone]?.chosenPlayer).toBeUndefined();
  });

  it("is gone with the permanent (rule 400.7)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = answering(C);
    const archon = play(game, "Guardian Archon", "Plains", 6);
    game.debugMove(archon, "graveyard");
    expect(game.state.objects[archon].secretChoice).toBeUndefined();
    expect(game.state.objects[archon].chosenPlayer).toBeUndefined();
  });
});

describe("the reveal cost", () => {
  /** Alice's Leonin, secretly on `chosen`, and Bob's Bears attacking her. */
  function leoninAttacked(chosen: PlayerId) {
    const t = table({ players: 3 });
    t.a.chooseCreatureTypeFn = answering(chosen);
    const leonin = play(t.game, "Stalking Leonin", "Plains", 3);
    const bears = spawn(t.game, "Grizzly Bears", B);
    t.game.state.objects[bears].attacking = A;
    return { ...t, leonin, bears };
  }

  it("shows the choice to everyone, and the ability exiles a creature of the chosen player's", () => {
    const { game, leonin, bears } = leoninAttacked(B);
    expect(game.viewFor(C).objects[leonin]?.chosenPlayer).toBeUndefined();
    activate(game, leonin, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.viewFor(C).objects[leonin]?.chosenPlayer).toBe(B);
    expect(game.viewFor(C).objects[leonin]?.secretChoice).toBeUndefined();
    expect(game.viewFor(A).objects[leonin]?.secretChoice).toBeUndefined();
    expect(eventsOf(game, "secret-choice-revealed")).toMatchObject([{ object: leonin, player: A, choice: B }]);
  });

  it("is shown as soon as it's paid, with the ability still on the stack", () => {
    const { game, leonin, bears } = leoninAttacked(B);
    activate(game, leonin, 0, { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(game.viewFor(C).objects[leonin]?.chosenPlayer).toBe(B);
  });

  it("a creature of another player's is targeted all the same, and stays: the secret's spent", () => {
    const { game, leonin, bears } = leoninAttacked(C);
    activate(game, leonin, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.viewFor(B).objects[leonin]?.chosenPlayer).toBe(C);
  });

  it("targets only a creature attacking you", () => {
    const { game, leonin, bears } = leoninAttacked(B);
    game.state.objects[bears].attacking = C;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: leonin, abilityIndex: 0, targets: [ref(bears)] })).not.toBeNull();
    game.state.objects[bears].attacking = null;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: leonin, abilityIndex: 0, targets: [ref(bears)] })).not.toBeNull();
  });

  it("reads the chosen player as the source last existed once it's gone (rule 608.2h)", () => {
    const { game, leonin, bears } = leoninAttacked(B);
    activate(game, leonin, 0, { targets: [ref(bears)], settle: false });
    game.debugMove(leonin, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
  });

  it("activates only once, and isn't an exhaust ability", () => {
    const { game, leonin, bears } = leoninAttacked(B);
    const second = spawn(game, "Grizzly Bears", B);
    game.state.objects[second].attacking = A;
    activate(game, leonin, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: leonin, abilityIndex: 0, targets: [ref(second)] })).toMatch(/only once/);
    expect(game.registry.get("Stalking Leonin").activated[0].exhaust).toBeUndefined();
  });

  it("can't be paid by anyone else: a new controller made no choice", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = answering(C);
    const archon = play(game, "Guardian Archon", "Plains", 6);
    game.state.objects[archon].controller = B;
    const bears = spawn(game, "Grizzly Bears", B);
    passTo(game, B);
    expect(game.canDispatch({ type: "activate-ability", player: B, source: archon, abilityIndex: 0, targets: [ref(bears)] })).toMatch(/no secret choice/);
    // And it still isn't shown to them.
    expect(game.viewFor(B).objects[archon]?.chosenPlayer).toBeUndefined();
    // Should the chooser get it back, the choice is theirs to reveal again.
    game.state.objects[archon].controller = A;
    passTo(game, A);
    const mine = spawn(game, "Grizzly Bears", A);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: archon, abilityIndex: 0, targets: [ref(mine)] })).toBeNull();
  });

  it("nothing was chosen, nothing to reveal", () => {
    const { game } = table({ players: 3 });
    const silent = spawn(game, "Stalking Leonin");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].attacking = A;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: silent, abilityIndex: 0, targets: [ref(bears)] })).toMatch(/no secret choice/);
  });
});

describe("Guardian Archon's protection from the chosen player (rule 702.16k)", () => {
  /** Alice's Archon, on Bob; Bob's turn, Alice revealed it for her Bears. */
  function revealed() {
    const t = table({ players: 3 });
    t.a.chooseCreatureTypeFn = answering(B);
    const archon = play(t.game, "Guardian Archon", "Plains", 6);
    const bears = spawn(t.game, "Grizzly Bears");
    nextTurn(t.game);
    passTo(t.game, A);
    activate(t.game, archon, 0, { targets: [ref(bears)] });
    return { ...t, archon, bears };
  }
  const bolt = (game: Game, player: PlayerId, at: PlayerId | ObjectId) => {
    lands(game, "Mountain", 1, player);
    const card = toHand(game, "Lightning Bolt", player);
    passTo(game, player);
    return game.canDispatch({ type: "cast-spell", player, card, targets: [ref(at)] });
  };

  it("the chosen player's spells can't target you or the permanent; another player's can", () => {
    const { game, bears } = revealed();
    expect(bolt(game, B, A)).not.toBeNull();
    expect(bolt(game, B, bears)).not.toBeNull();
    expect(bolt(game, C, A)).toBeNull();
    expect(bolt(game, C, bears)).toBeNull();
    // Nor is it anyone else's protection: Alice's archon isn't protected.
    expect(bolt(game, B, C)).toBeNull();
  });

  it("damage from the chosen player's sources is prevented", () => {
    const { game, b } = revealed();
    const before = life(game, A);
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    attack(game, b, [giant], A);
    expect(eventsOf(game, "damage-prevented").length).toBeGreaterThan(0);
    expect(life(game, A)).toBe(before);
  });

  it("the permanent takes no damage from them either", () => {
    const { game, a, b, bears } = revealed();
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    a.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, b, [giant], A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("lasts until end of turn", () => {
    const { game, bears } = revealed();
    nextTurn(game);
    expect(bolt(game, B, A)).toBeNull();
    expect(bolt(game, B, bears)).toBeNull();
  });
});

describe("Emissary of Grudges: new targets for what the chosen player aimed at you", () => {
  /** Alice's Emissary, secretly on `chosen`; `caster`'s Bolt on the stack, at `at`. */
  function bolted(chosen: PlayerId, caster: PlayerId, at: (mine: ObjectId, theirs: ObjectId) => PlayerId | ObjectId) {
    const t = table({ players: 3 });
    t.a.chooseCreatureTypeFn = answering(chosen);
    const emissary = play(t.game, "Emissary of Grudges", "Mountain", 6);
    const mine = spawn(t.game, "Grizzly Bears");
    const theirs = spawn(t.game, "Hill Giant", C);
    lands(t.game, "Mountain", 1, caster);
    const bolt = toHand(t.game, "Lightning Bolt", caster);
    passTo(t.game, caster);
    t.game.dispatch({ type: "cast-spell", player: caster, card: bolt, targets: [ref(at(mine, theirs))] });
    passTo(t.game, A);
    return { ...t, emissary, mine, theirs, bolt };
  }

  it("the chosen player's spell at you: you choose a new target", () => {
    const { game, emissary, theirs, bolt } = bolted(B, B, () => A);
    activate(game, emissary, 0, { targets: [ref(bolt)], settle: false });
    resolveTop(game);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(theirs)] });
    expect(game.state.objects[bolt].targets).toEqual([ref(theirs)]);
  });

  it("at a permanent you control: the same", () => {
    const { game, emissary, theirs, bolt } = bolted(B, B, (mine) => mine);
    activate(game, emissary, 0, { targets: [ref(bolt)], settle: false });
    resolveTop(game);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(theirs)] });
    expect(game.state.objects[bolt].targets).toEqual([ref(theirs)]);
  });

  it("an ability counts as well as a spell", () => {
    const t = table({ players: 3 });
    t.a.chooseCreatureTypeFn = answering(B);
    const emissary = play(t.game, "Emissary of Grudges", "Mountain", 6);
    const theirs = spawn(t.game, "Hill Giant", C);
    const pinger = spawn(t.game, "Prodigal Pyromancer", B, { sick: false });
    passTo(t.game, B);
    t.game.dispatch({ type: "activate-ability", player: B, source: pinger, abilityIndex: 0, targets: [ref(A)] });
    const ability = t.game.state.zones.shared.stack.at(-1) as ObjectId;
    passTo(t.game, A);
    activate(t.game, emissary, 0, { targets: [ref(ability)], settle: false });
    resolveTop(t.game);
    expect(t.game.state.awaiting?.kind).toBe("choose-targets");
    t.game.dispatch({ type: "choose-targets", player: A, targets: [ref(theirs)] });
    expect(t.game.state.objects[ability].targets).toEqual([ref(theirs)]);
  });

  it("nothing for another player's spell", () => {
    const { game, emissary, bolt } = bolted(C, B, () => A);
    activate(game, emissary, 0, { targets: [ref(bolt)], settle: false });
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.objects[bolt].targets).toEqual([ref(A)]);
  });

  it("nothing for one that doesn't target you or yours", () => {
    const { game, emissary, theirs, bolt } = bolted(B, B, (_m, t) => t);
    activate(game, emissary, 0, { targets: [ref(bolt)], settle: false });
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.objects[bolt].targets).toEqual([ref(theirs)]);
  });
});

describe("A Killer Among Us", () => {
  function killer(chosen: string) {
    const t = table({ players: 2 });
    t.a.chooseCreatureTypeFn = answering(chosen);
    const enchantment = play(t.game, "A Killer Among Us", "Forest", 5);
    return { ...t, enchantment };
  }
  const tokenOf = (game: Game, name: string): ObjectId => {
    const id = game.state.zones.shared.battlefield.find((o) => game.state.objects[o].cardName === `${name} Token`);
    if (id === undefined) throw new Error(`no ${name} token`);
    return id;
  };

  it("makes the three tokens, then asks", () => {
    const { game } = killer("Human");
    for (const name of ["Human", "Merfolk", "Goblin"]) expect(zone(game, tokenOf(game, name))).toBe("battlefield");
  });

  it("the sacrifice is paid with the reveal; the chosen type gets the counters and deathtouch", () => {
    const { game, enchantment } = killer("Goblin");
    const goblin = tokenOf(game, "Goblin");
    game.state.objects[goblin].attacking = B;
    activate(game, enchantment, 0, { targets: [ref(goblin)] });
    expect(zone(game, enchantment)).toBe("graveyard");
    expect(counters(game, goblin)).toBe(3);
    expect(keywords(game, goblin).has("deathtouch")).toBe(true);
    expect(eventsOf(game, "secret-choice-revealed")).toMatchObject([{ choice: "Goblin" }]);
  });

  it("a token of another type gets nothing, and the enchantment's still gone", () => {
    const { game, enchantment } = killer("Human");
    const goblin = tokenOf(game, "Goblin");
    game.state.objects[goblin].attacking = B;
    activate(game, enchantment, 0, { targets: [ref(goblin)] });
    expect(zone(game, enchantment)).toBe("graveyard");
    expect(counters(game, goblin)).toBe(0);
    expect(keywords(game, goblin).has("deathtouch")).toBe(false);
  });

  it("needs an attacking creature token", () => {
    const { game, enchantment } = killer("Goblin");
    const goblin = tokenOf(game, "Goblin");
    const activating = (id: ObjectId) =>
      game.canDispatch({ type: "activate-ability", player: A, source: enchantment, abilityIndex: 0, targets: [ref(id)] });
    expect(activating(goblin)).not.toBeNull();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].attacking = B;
    expect(activating(bears)).not.toBeNull();
    game.state.objects[goblin].attacking = B;
    expect(activating(goblin)).toBeNull();
  });
});

describe("Goblin Game: a secret number, kept by `vote`", () => {
  it("each loses what they hid, then the fewest loses half, rounded up", () => {
    const { game, a, b } = table({ players: 2 });
    a.chooseNumberFn = () => 4;
    b.chooseNumberFn = () => 1;
    play(game, "Goblin Game", "Mountain", 7);
    expect(life(game, A)).toBe(16);
    // Bob: 20 - 1 = 19, then half of 19, rounded up.
    expect(life(game, B)).toBe(9);
  });

  it("a tie for fewest is each of them", () => {
    const { game, a, b, c } = table({ players: 3 });
    a.chooseNumberFn = () => 2;
    b.chooseNumberFn = () => 2;
    c.chooseNumberFn = () => 5;
    play(game, "Goblin Game", "Mountain", 7);
    expect(life(game, A)).toBe(9);
    expect(life(game, B)).toBe(9);
    expect(life(game, C)).toBe(15);
  });

  it("asks for at least one, each player in turn, and no one's number is in the log until all are in", () => {
    const { game, a, b } = table({ players: 2 });
    const mins: number[] = [];
    const logged = (): number => eventsOf(game, "number-chosen").length + eventsOf(game, "vote-cast").length;
    a.chooseNumberFn = (_v, offer) => {
      mins.push(offer.min);
      return 1;
    };
    b.chooseNumberFn = (_v, offer) => {
      mins.push(offer.min);
      expect(logged()).toBe(0);
      return 1;
    };
    play(game, "Goblin Game", "Mountain", 7);
    expect(mins).toEqual([1, 1]);
  });
});
