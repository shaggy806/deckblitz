/**
 * "As this enters, look at an opponent's hand, then choose …"
 * (`CardDefinition.chooseOnEnterLook` — Arachne, Psionic Weaver), and the looks
 * at a target player's library past the top card (`look-at-library-top`'s
 * `count` — Orcish Spy; `look-and-choose` from a target — Dimir Charm). What's
 * looked at is hidden from everyone else (rules 400.2, 401.2).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { SPECTATOR } from "../view.js";
import {
  A,
  B,
  C,
  D,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const typeOffer = (game: Game, player = A): Extract<LegalAction, { kind: "choose-creature-type" }> | undefined =>
  game
    .legalActions(player)
    .find((a): a is Extract<LegalAction, { kind: "choose-creature-type" }> => a.kind === "choose-creature-type");

const castArachne = (game: Game): ObjectId => {
  lands(game, "Plains", 3);
  const arachne = toHand(game, "Arachne, Psionic Weaver");
  cast(game, arachne, { settle: false });
  game.advanceUntil((s) => s.awaiting !== null);
  return arachne;
};

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("look at an opponent's hand as it enters", () => {
  it("asks which opponent, then shows that hand beside the card types, to the chooser alone", () => {
    const { game } = table({ players: 4 });
    const bolt = toHand(game, "Lightning Bolt", C);
    const secret = toHand(game, "Divination", B);
    const arachne = castArachne(game);

    // Which opponent first, among two or more.
    expect(typeOffer(game)?.options).toEqual([B, C, D]);
    expect(typeOffer(game)?.looked).toBeUndefined();
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: C });

    // Still about to enter, and now the types, with Carol's hand and nobody else's.
    expect(zone(game, arachne)).toBe("stack");
    const offer = typeOffer(game);
    expect(offer?.options).toEqual(["artifact", "battle", "enchantment", "instant", "kindred", "land", "planeswalker", "sorcery"]);
    expect(offer?.looked).toEqual(hand(game, C));
    expect(game.viewFor(A).objects[bolt]?.cardName).toBe("Lightning Bolt");
    expect(game.viewFor(A).objects[secret]?.cardName ?? null).toBeNull();
    expect(game.viewFor(C).objects[bolt]?.cardName).toBe("Lightning Bolt");
    for (const other of [B, D, SPECTATOR]) {
      const view = game.viewFor(other);
      expect(view.objects[bolt]?.cardName ?? null).toBeNull();
      // Not by name, and not by which ids were looked at.
      expect(JSON.stringify(view)).not.toContain("Lightning Bolt");
      expect(view.awaiting).not.toHaveProperty("looked");
    }
    expect(typeOffer(game, B)).toBeUndefined();

    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "instant" });
    settle(game);
    expect(zone(game, arachne)).toBe("battlefield");
    expect(game.state.objects[arachne].chosenOnEnter).toBe("instant");
    // The look ends with the choice.
    expect(game.viewFor(A).objects[bolt]?.cardName ?? null).toBeNull();
  });

  it("goes straight to the one opponent's hand, and an empty hand is an empty look", () => {
    const { game } = table();
    const held = toHand(game, "Lightning Bolt", B);
    castArachne(game);
    expect(typeOffer(game)?.looked).toEqual(hand(game, B));
    expect(typeOffer(game)?.looked).toContain(held);

    const next = table();
    next.game.state.zones.perPlayer[B].hand = [];
    castArachne(next.game);
    expect(typeOffer(next.game)?.looked).toEqual([]);
    expect(typeOffer(next.game)?.options).toContain("sorcery");
  });

  it("makes spells of the chosen type cost {1} more, for every player, and nothing else", () => {
    const { game } = table();
    const theirs = toHand(game, "Divination", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const mine = toHand(game, "Divination", A);
    // A view says a cost only when it differs from the printed one.
    const costOf = (id: ObjectId, viewer = B): string | undefined => game.viewFor(viewer).objects[id]?.effectiveManaCost;
    expect(costOf(theirs)).toBeUndefined();
    castArachne(game);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "sorcery" });
    settle(game);
    expect(costOf(theirs)).toBe("{3}{U}");
    expect(costOf(mine, A)).toBe("{3}{U}");
    expect(costOf(bolt)).toBeUndefined();
  });

  it("counts a spell of the type with other types too", () => {
    const { game } = table();
    const thopter = toHand(game, "Ornithopter", B);
    const bears = toHand(game, "Grizzly Bears", B);
    castArachne(game);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "artifact" });
    settle(game);
    expect(game.viewFor(B).objects[thopter]?.effectiveManaCost).toBe("{1}");
    expect(game.viewFor(B).objects[bears]?.effectiveManaCost).toBeUndefined();
  });

  it("a clone of it looks and chooses for itself", () => {
    const { game, a } = table();
    const held = toHand(game, "Lightning Bolt", B);
    const first = spawn(game, "Arachne, Psionic Weaver", B);
    game.state.objects[first].chosenOnEnter = "sorcery";
    a.chooseCopyFn = () => first;
    a.chooseCreatureTypeFn = () => "instant";
    lands(game, "Island", 6);
    const clone = toHand(game, "Clone");
    cast(game, clone, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    expect(typeOffer(game)?.looked).toContain(held);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "instant" });
    settle(game);
    expect(game.state.objects[clone].chosenOnEnter).toBe("instant");
  });

  it("a bot taxes what the hand it looked at holds most of, never land", () => {
    const { game } = table();
    game.state.zones.perPlayer[B].hand = [];
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Shock", B);
    toHand(game, "Divination", B);
    toHand(game, "Plains", B);
    toHand(game, "Plains", B);
    toHand(game, "Plains", B);
    const arachne = castArachne(game);
    const bot = new HeuristicBotController(A, game.registry);
    const answer = bot.chooseCreatureType(game.controllerView(A), arachne, typeOffer(game)!.options, []);
    expect(answer).toBe("instant");
  });
});

describe("look at the top cards of target player's library", () => {
  it("Orcish Spy shows the top three to its controller alone, and they stay as they were", () => {
    const { game } = table({ players: 4 });
    const spy = spawn(game, "Orcish Spy");
    const before = [...library(game, C)];
    const top = before.slice(0, 3);
    activate(game, spy, 0, { targets: [ref(C)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-from-zone" && awaiting.ids).toEqual(top);
    expect(awaiting?.kind === "choose-from-zone" && awaiting.prompt).toBe("Looking at the top 3 cards of that player's library");
    for (const id of top) expect(game.viewFor(A).objects[id]?.cardName).toBeDefined();
    // The library's owner doesn't see them either, nor does anyone else.
    for (const other of [B, C, D, SPECTATOR]) {
      for (const id of top) expect(game.viewFor(other).objects[id]?.cardName ?? null).toBeNull();
    }
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    expect(library(game, C)).toEqual(before);
    expect(game.state.objects[top[0]].zone).toBe("library");
  });

  it("shows as many as there are, and asks nothing of an empty library", () => {
    const { game } = table();
    const spy = spawn(game, "Orcish Spy");
    game.state.zones.perPlayer[B].library = [...library(game, B).slice(0, 2)];
    activate(game, spy, 0, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-from-zone" && awaiting.ids.length).toBe(2);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);

    const next = table();
    const other = spawn(next.game, "Orcish Spy");
    next.game.state.zones.perPlayer[B].library = [];
    activate(next.game, other, 0, { targets: [ref(B)], settle: false });
    next.game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(next.game.state.awaiting).toBeNull();
  });

  it("Dimir Charm puts one back on that library and the rest into that player's graveyard", () => {
    const { game } = table({ players: 3 });
    lands(game, "Underground Sea", 2);
    const charm = toHand(game, "Dimir Charm");
    const top = library(game, B).slice(0, 3);
    cast(game, charm, { modes: [2], targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(game.viewFor(A).objects[top[1]]?.cardName).toBeDefined();
    for (const other of [B, C, SPECTATOR]) {
      expect(game.viewFor(other).objects[top[1]]?.cardName ?? null).toBeNull();
    }
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [top[1]] });
    settle(game);
    expect(library(game, B)[0]).toBe(top[1]);
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([top[0], top[2]]));
    expect(graveyard(game, A)).not.toEqual(expect.arrayContaining([top[0]]));
    expect(zone(game, charm)).toBe("graveyard");
  });

  it("Dimir Charm's other modes: a sorcery countered, a small creature destroyed", () => {
    const { game } = table();
    lands(game, "Underground Sea", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Hill Giant", B);
    const charm = toHand(game, "Dimir Charm");
    const refused = game.canDispatch({ type: "cast-spell", player: A, card: charm, modes: [1], targets: [ref(big)] });
    expect(refused).not.toBeNull();
    cast(game, charm, { modes: [1], targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");

    // A sorcery on the stack, countered from another seat's priority.
    const next = table();
    lands(next.game, "Island", 3);
    const sorcery = toHand(next.game, "Divination");
    cast(next.game, sorcery, { settle: false });
    lands(next.game, "Underground Sea", 2, B);
    const answer = toHand(next.game, "Dimir Charm", B);
    next.game.dispatch({ type: "pass-priority", player: A });
    cast(next.game, answer, { player: B, modes: [0], targets: [ref(sorcery)] });
    expect(zone(next.game, sorcery)).toBe("graveyard");
  });
});
