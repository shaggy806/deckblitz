/**
 * "Whenever one or more cards are put into a library from anywhere" — the
 * `put-into-library` trigger event (`cards-put-into-library`, one per
 * simultaneous move of cards into libraries from other zones), `batched`.
 * Wan Shi Tong, All-Knowing makes two Spirits; Dutiful Knowledge Seeker
 * gets a +1/+1 counter. A scry, a surveil or a shuffle moves nothing into a
 * library (Wan Shi Tong's ruling), and a token isn't a card (rule 111.1).
 * The trigger looks back in time when a card all players could see went
 * (rule 603.10a): Wan Shi Tong tucking itself still makes its Spirits.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const WAN = "Wan Shi Tong, All-Knowing";
const SEEKER = "Dutiful Knowledge Seeker";
const SPIRIT = "Spirit Token (Colorless, Evasive)";

describe("Wan Shi Tong, All-Knowing", () => {
  it("its enters trigger tucks a permanent: one move into a library, two Spirits", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    // Bob, the owner, picks the bottom (the second choice).
    pickModes(b, 1);
    enter(game, WAN);
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(bears);
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("second from the top is the owner's other choice", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(b, 0);
    enter(game, WAN);
    expect(game.state.zones.perPlayer[B].library[1]).toBe(bears);
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("tucking itself: it looks back to the battlefield and still makes its Spirits (rule 603.10a)", () => {
    const { game, a } = table();
    a.chooseTargetsFn = (_view, _name, _specs, options) => [options[0].find((t) => t.kind === "object" && game.state.objects[t.object]?.cardName === WAN) ?? null];
    pickModes(a, 1);
    const wan = enter(game, WAN);
    expect(zone(game, wan)).toBe("library");
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("Brainstorm's two cards go back as one move: one trigger", () => {
    const { game, a } = table();
    spawn(game, WAN);
    lands(game, "Island", 1);
    const [first, second] = game.state.zones.perPlayer[A].hand;
    pickFromZone(a, first, second);
    cast(game, toHand(game, "Brainstorm"));
    expect(zone(game, first)).toBe("library");
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("every player's hand and graveyard shuffled in at once (Timetwister): one trigger", () => {
    const { game } = table();
    spawn(game, WAN);
    lands(game, "Island", 3);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Timetwister"));
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("each opponent's cards count, a creature put on the bottom from the battlefield too (Hallowed Burial)", () => {
    const { game } = table();
    const wan = spawn(game, WAN);
    lands(game, "Plains", 5);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hallowed Burial"));
    // Wan Shi Tong went with them, and looks back.
    expect(zone(game, wan)).toBe("library");
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });

  it("a scry to the bottom and a surveil move nothing into a library (its ruling)", () => {
    const { game, a } = table();
    spawn(game, WAN);
    lands(game, "Island", 2);
    a.chooseScryFn = (_view, cards) => cards;
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Consider"));
    expect(tokensNamed(game, SPIRIT, A)).toBe(0);
  });

  it("a token put into a library isn't a card", () => {
    const { game } = table();
    spawn(game, WAN);
    game.debugApplyEffect(B, { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 1 }, []);
    const [token] = game.battlefield.filter((id) => game.state.objects[id].controller === B);
    game.debugApplyEffect(A, { kind: "put-on-library", target: 0, position: "top" }, [{ kind: "object", object: token }]);
    settle(game);
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
    expect(tokensNamed(game, SPIRIT, A)).toBe(0);
    // A card is: the same move of a card does trigger.
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "put-on-library", target: 0, position: "top" }, [{ kind: "object", object: bears }]);
    settle(game);
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
  });
});

describe("Dutiful Knowledge Seeker", () => {
  it("its own ability puts a graveyard card on the bottom: a +1/+1 counter", () => {
    const { game } = table();
    const seeker = spawn(game, SEEKER);
    lands(game, "Island", 3);
    const card = toGraveyard(game, "Grizzly Bears", B);
    activate(game, seeker, 0, { targets: [{ kind: "object", object: card }] });
    expect(zone(game, card)).toBe("library");
    expect(counters(game, seeker)).toBe(1);
  });

  it("several cards at once are one trigger: one counter", () => {
    const { game } = table();
    const seeker = spawn(game, SEEKER);
    lands(game, "Island", 3);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Timetwister"));
    expect(counters(game, seeker)).toBe(1);
  });
});
