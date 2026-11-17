/**
 * "Tap another target nonland permanent. Its activated abilities can't be
 * activated for as long as it remains tapped." (Braided Net): a `prohibit`
 * whose duration is `{ whileTapped: 0 }` — that permanent in this stint,
 * tapped as the effect begins (rule 611.2b) — ended as it untaps or leaves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  activate,
  counters,
  enter,
  hand,
  lands,
  pickFromZone,
  ref,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === source);
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Braided Net", () => {
  it("enters with three net counters, and taps a permanent whose activated abilities stop until it untaps", () => {
    const { game } = table();
    const net = enter(game, "Braided Net");
    expect(counters(game, net, "net")).toBe(3);
    const dragon = spawn(game, "Shivan Dragon");
    lands(game, "Mountain", 2);
    expect(canActivate(game, dragon)).toBe(true);
    activate(game, net, 0, { targets: [ref(dragon)] });
    expect(counters(game, net, "net")).toBe(2);
    expect(isTapped(game, dragon)).toBe(true);
    // "{R}: +1/+0" needs no tapping, and still can't be activated.
    expect(canActivate(game, dragon)).toBe(false);
    // Its controller's next untap step untaps it, and that ends it.
    toStep(game, "precombat-main");
    expect(isTapped(game, dragon)).toBe(false);
    lands(game, "Mountain", 1);
    expect(canActivate(game, dragon)).toBe(true);
  });

  it("an already-tapped target is held until anything untaps it", () => {
    const { game } = table();
    const net = enter(game, "Braided Net");
    const dragon = spawn(game, "Shivan Dragon", A, { tapped: true });
    lands(game, "Mountain", 2);
    activate(game, net, 0, { targets: [ref(dragon)] });
    expect(canActivate(game, dragon)).toBe(false);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(dragon)]);
    expect(isTapped(game, dragon)).toBe(false);
    expect(canActivate(game, dragon)).toBe(true);
    // Tapped again by other means, nothing comes back (611.2b: it ended).
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(dragon)]);
    expect(canActivate(game, dragon)).toBe(true);
  });

  it("can't target itself or a land", () => {
    const { game } = table();
    const net = enter(game, "Braided Net");
    const [island] = lands(game, "Island", 1);
    expect(() => activate(game, net, 0, { targets: [ref(net)] })).toThrow(/target/i);
    expect(() => activate(game, net, 0, { targets: [ref(island)] })).toThrow(/target/i);
  });

  it("crafted, Braided Quipu draws a card for each artifact you control, then goes third from the top", () => {
    const { game, a } = table();
    const net = enter(game, "Braided Net");
    spawn(game, "Sol Ring");
    const material = toGraveyard(game, "Ornithopter");
    lands(game, "Island", 6);
    pickFromZone(a, material);
    activate(game, net, 1);
    expect(printedCardName(game.state.objects[net])).toBe("Braided Quipu");
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    const before = hand(game).length;
    activate(game, net, 0);
    // Quipu and Sol Ring: two artifacts.
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, net)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(net)).toBe(2);
  });
});
